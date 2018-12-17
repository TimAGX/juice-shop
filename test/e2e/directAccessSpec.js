const config = require('config')
let blueprint

for (const product of config.get('products')) {
  if (product.fileForRetrieveBlueprintChallenge) {
    blueprint = product.fileForRetrieveBlueprintChallenge
    break
  }
}

describe('/', () => {
  describe('challenge "easterEgg2"', () => {
    it('should be able to access "secret" url for easter egg', () => {
      browser.driver.get(browser.baseUrl + '/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg')
    })

    protractor.expect.challengeSolved({ challenge: 'Easter Egg Tier 2' })
  })

  describe('challenge "premiumPaywall"', () => {
    it('should be able to access "super secret" url for premium content', () => {
      browser.driver.get(browser.baseUrl + '/this/page/is/hidden/behind/an/incredibly/high/paywall/that/could/only/be/unlocked/by/sending/1btc/to/us')
    })

    protractor.expect.challengeSolved({ challenge: 'Premium Paywall' })
  })

  describe('challenge "extraLanguage"', () => {
    it('should be able to access the Klingon translation file', () => {
      browser.driver.get(browser.baseUrl + '/assets/i18n/tlh_AA.json')
    })

    protractor.expect.challengeSolved({ challenge: 'Extra Language' })
  })

  describe('challenge "retrieveBlueprint"', () => {
    it('should be able to access the blueprint file', () => {
      browser.driver.get(browser.baseUrl + '/assets/public/images/products/' + blueprint)
    })

    protractor.expect.challengeSolved({ challenge: 'Retrieve Blueprint' })
  })

  describe('challenge "securityPolicy"', () => {
    it('should be able to access the security.txt file', () => {
      browser.driver.get(browser.baseUrl + '/.well-known/security.txt')
    })

    protractor.expect.challengeSolved({ challenge: 'Security Policy' })
  })

  describe('challenge "emailLeak"', () => {
    it('should be able to request the callback on /rest/user/whoami', () => {
      browser.driver.get(browser.baseUrl + '/rest/user/whoami?callback=func')
    })

    protractor.expect.challengeSolved({ challenge: 'Email Leak' })
  })
})
