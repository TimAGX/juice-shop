/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const { Bot } = require('juicy-chat-bot')
const insecurity = require('../lib/insecurity')
const jwt = require('jsonwebtoken')
const utils = require('../lib/utils')
const config = require('config')
const fs = require('fs')
const models = require('../models/index')

const trainingSet = fs.readFileSync(`data/static/${config.get('application.chatBot.trainingData')}`)

const bot = new Bot(config.get('application.chatBot.name'), config.get('application.chatBot.greeting'), trainingSet, config.get('application.chatBot.defaultResponse'))
bot.train()

async function processQuery (user, req, res) {
  const username = user.username
  if (!username) {
    res.status(200).json({
      action: 'namequery',
      body: 'I\'m sorry I didn\'t get your name. What shall I call you?'
    })
    return
  }

  if (!bot.factory.run(`currentUser('${user.id}')`)) {
    bot.addUser(`${user.id}`, username)
    res.status(200).json({
      action: 'response',
      body: bot.greet(`${user.id}`)
    })
    return
  }

  if (bot.factory.run(`currentUser('${user.id}')`) !== username) {
    bot.addUser(`${user.id}`, username)
  }

  if (!req.body.query) {
    res.status(200).json({
      action: 'response',
      body: bot.greet(`${user.id}`)
    })
    return
  }

  const response = await bot.respond(req.body.query, user.id)
  res.status(200).json(response)
}

function setUserName (user, req, res) {
  models.User.findByPk(user.id).then(user => {
    user.update({ username: req.body.query }).then(newuser => {
      newuser = utils.queryResultToJson(newuser)
      const updatedToken = insecurity.authorize(newuser)
      insecurity.authenticatedUsers.put(updatedToken, newuser)
      bot.addUser(`${newuser.id}`, req.body.query)
      res.status(200).json({
        action: 'response',
        body: bot.greet(`${newuser.id}`),
        token: updatedToken
      })
    })
  })
}

module.exports.bot = bot

module.exports.status = function status () {
  return async (req, res, next) => {
    const token = req.cookies.token || utils.jwtFrom(req)
    if (token) {
      const user = await new Promise((resolve, reject) => {
        jwt.verify(token, insecurity.publicKey, (err, decoded) => {
          if (err !== null) {
            res.status(401).json({
              error: 'Unauthenticated user'
            })
          } else {
            resolve(decoded.data)
          }
        })
      })

      if (!user) {
        return
      }

      const username = user.username

      if (!username) {
        res.status(200).json({
          action: 'namequery',
          body: 'I\'m sorry I didn\'t get your name. What shall I call you?'
        })
        return
      }

      bot.addUser(`${user.id}`, username)

      res.status(200).json({
        status: bot.training.state,
        body: bot.training.state ? bot.greet(`${user.id}`) : `${config.get('application.chatBot.name')} isn't ready at the moment, please wait while I set things up`
      })
      return
    }

    res.status(200).json({
      status: bot.training.state,
      body: `Hi, I can't recognize you. Sign in to talk to ${config.get('application.chatBot.name')}`
    })
  }
}

module.exports.process = function respond () {
  return async (req, res, next) => {
    const token = req.cookies.token || utils.jwtFrom(req)
    if (!bot.training.state || !token) {
      res.status(400).json({
        error: 'Unauthenticated user'
      })
      return
    }

    const user = await new Promise((resolve, reject) => {
      jwt.verify(token, insecurity.publicKey, (err, decoded) => {
        if (err !== null) {
          res.status(401).json({
            error: 'Unauthenticated user'
          })
        } else {
          resolve(decoded.data)
        }
      })
    })

    if (!user) {
      return
    }

    if (req.body.action === 'query') {
      await processQuery(user, req, res)
    } else if (req.body.action === 'setname') {
      setUserName(user, req, res)
    }
  }
}
