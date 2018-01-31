const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('redirect', () => {
  const performRedirect = require('../../routes/redirect')
  const challenges = require('../../data/datacache').challenges

  beforeEach(() => {
    this.req = { query: {} }
    this.res = { redirect: sinon.spy(), status: sinon.spy() }
    this.next = sinon.spy()
    this.save = () => ({
      then: function () { }
    })
  })

  describe('should be performed for all whitelisted URLs', () => {
    require('../../lib/insecurity').redirectWhitelist.forEach(url => {
      it(url, () => {
        this.req.query.to = url

        performRedirect()(this.req, this.res, this.next)

        expect(this.res.redirect).to.have.been.calledWith(url)
      })
    })
  })

  it('should raise error for URL not on whitelist', () => {
    this.req.query.to = 'http://kimminich.de'

    performRedirect()(this.req, this.res, this.next)

    expect(this.res.redirect).to.have.not.been.calledWith(sinon.match.any)
    expect(this.next).to.have.been.calledWith(sinon.match.instanceOf(Error))
  })

  it('redirecting to https://gratipay.com/juice-shop should solve the "redirectGratipayChallenge"', () => {
    this.req.query.to = 'https://gratipay.com/juice-shop'
    challenges.redirectGratipayChallenge = { solved: false, save: this.save }

    performRedirect()(this.req, this.res)

    expect(challenges.redirectGratipayChallenge.solved).to.equal(true)
  })

  it('tricking the whitelist should solve "redirectChallenge"', () => {
    this.req.query.to = 'http://kimminich.de?to=https://github.com/bkimminich/juice-shop'
    challenges.redirectChallenge = { solved: false, save: this.save }

    performRedirect()(this.req, this.res)

    expect(challenges.redirectChallenge.solved).to.equal(true)
  })
})
