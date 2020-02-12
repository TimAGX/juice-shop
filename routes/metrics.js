/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const Prometheus = require('prom-client')
const orders = require('../data/mongodb').orders
const challenges = require('../data/datacache').challenges
const utils = require('../lib/utils')
const config = require('config')
const models = require('../models')
const Op = models.Sequelize.Op

exports.serveMetrics = function serveMetrics (reg) {
  return (req, res, next) => {
    utils.solveIf(challenges.exposedMetricsChallenge, () => { return true })
    res.set('Content-Type', reg.contentType)
    res.end(reg.metrics())
  }
}

exports.observeMetrics = function observeMetrics () {
  const app = config.get('application.metricsAppLabelValue')
  const register = new Prometheus.Registry()
  const intervalCollector = Prometheus.collectDefaultMetrics({ timeout: 5000, register })
  register.setDefaultLabels({ app })

  const challengeMetrics = new Prometheus.Gauge({
    name: `${app}_challenges_solved`,
    help: 'Number of solved challenges grouped by difficulty.',
    labelNames: ['difficulty', 'count']
  })

  const challengeTotalMetrics = new Prometheus.Gauge({
    name: `${app}_challenges_solved_total`,
    help: 'Total number of challenges that have been solved.',
    labelNames: ['count']
  })

  const orderMetrics = new Prometheus.Gauge({
    name: `${app}_orders_placed_total`,
    help: `Number of orders placed in ${config.get('application.name')}.`
  })

  const userMetrics = new Prometheus.Gauge({
    name: `${app}_users_registered`,
    help: 'Number of registered users grouped by customer type.',
    labelNames: ['type']
  })

  const userTotalMetrics = new Prometheus.Gauge({
    name: `${app}_users_registered_total`,
    help: 'Total number of registered users.'
  })

  const walletMetrics = new Prometheus.Gauge({
    name: `${app}_wallet_balance_total`,
    help: 'Total balance of all users\' digital wallets.'
  })

  const complaintMetrics = new Prometheus.Gauge({
    name: `${app}_user_complaints_total`,
    help: 'Unwarranted occurrences of customer lamentation.'
  })

  register.registerMetric(challengeMetrics)
  register.registerMetric(challengeTotalMetrics)
  register.registerMetric(orderMetrics)
  register.registerMetric(userMetrics)
  register.registerMetric(userTotalMetrics)
  register.registerMetric(walletMetrics)
  register.registerMetric(complaintMetrics)

  const updateLoop = setInterval(() => {
    const challengeKeys = Object.keys(challenges)
    challengeTotalMetrics.set({ count: challengeKeys.length }, 0)
    for (let difficulty = 1; difficulty <= 6; difficulty++) {
      const count = challengeKeys.filter((key) => (challenges[key].difficulty === difficulty)).length
      const solved = challengeKeys.filter((key) => (challenges[key].difficulty === difficulty && challenges[key].solved)).length
      challengeMetrics.set({ difficulty, count }, solved)
      if (solved > 0) challengeTotalMetrics.inc({ count: challengeKeys.length }, solved)
    }

    orders.count({}).then(orders => {
      orderMetrics.set(orders)
    })

    userTotalMetrics.set(0)
    models.User.count({ where: { role: { [Op.eq]: ['customer'] } } }).then(count => {
      userMetrics.set({ type: 'standard' }, count)
      if (count > 0) userTotalMetrics.inc(count)
    })
    models.User.count({ where: { role: { [Op.eq]: 'deluxe' } } }).then(count => {
      userMetrics.set({ type: 'deluxe' }, count)
      if (count > 0) userTotalMetrics.inc(count)
    })

    models.Wallet.sum('balance').then(totalBalance => {
      walletMetrics.set(totalBalance)
    })

    models.Complaint.count().then(count => {
      complaintMetrics.set(count)
    })
  }, 5000)

  return {
    register: register,
    probe: intervalCollector,
    updateLoop: updateLoop
  }
}
