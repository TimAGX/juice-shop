const frisby = require('frisby')
const Joi = frisby.Joi
const insecurity = require('../../lib/insecurity')
const config = require('config')

const otplib = require('otplib')
const jwt = require('jsonwebtoken')

const REST_URL = 'http://localhost:3000/rest'
const API_URL = 'http://localhost:3000/api'

const jsonHeader = { 'content-type': 'application/json' }

describe('/rest/2fa/verify', () => {
  it('POST should return a valid authentification when a valid tmp token is passed', async () => {
    const tmpTokenWurstbrot = insecurity.authorize({
      userId: 10,
      type: 'password_valid_needs_second_factor_token'
    })

    const totpToken = otplib.authenticator.generate('IFTXE3SPOEYVURT2MRYGI52TKJ4HC3KH')

    await frisby.post(REST_URL + '/2fa/verify', {
      headers: jsonHeader,
      body: {
        tmpToken: tmpTokenWurstbrot,
        totpToken
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'authentication', {
        token: Joi.string(),
        umail: Joi.string(),
        bid: Joi.number()
      })
      .expect('json', 'authentication', {
        umail: `wurstbrot@${config.get('application.domain')}`
      })
  })

  it('POST should fail if a invalid totp token is used', async () => {
    const tmpTokenWurstbrot = insecurity.authorize({
      userId: 10,
      type: 'password_valid_needs_second_factor_token'
    })

    const totpToken = otplib.authenticator.generate('THIS9ISNT8THE8RIGHT8SECRET')

    await frisby.post(REST_URL + '/2fa/verify', {
      headers: jsonHeader,
      body: {
        tmpToken: tmpTokenWurstbrot,
        totpToken
      }
    })
      .expect('status', 401)
  })

  it('POST should fail if a unsigned tmp token is used', async () => {
    const tmpTokenWurstbrot = jwt.sign({
      userId: 10,
      type: 'password_valid_needs_second_factor_token'
    }, 'this_surly_isnt_the_right_key')

    const totpToken = otplib.authenticator.generate('IFTXE3SPOEYVURT2MRYGI52TKJ4HC3KH')

    await frisby.post(REST_URL + '/2fa/verify', {
      headers: jsonHeader,
      body: {
        tmpToken: tmpTokenWurstbrot,
        totpToken
      }
    })
      .expect('status', 401)
  })
})

async function login ({ email, password, totpSecret }) {
  const loginRes = await frisby
    .post(REST_URL + '/user/login', {
      email,
      password
    }).catch((res) => {
      if (res.json && res.json.type && res.json.status === 'totp_token_requried') {
        return res
      }
      throw new Error(`Failed to login '${email}'`)
    })

  if (loginRes.json.status && loginRes.json.status === 'totp_token_requried') {
    const totpRes = await frisby
      .post(REST_URL + '/2fa/verify', {
        tmpToken: loginRes.json.data.tmpToken,
        totpToken: otplib.authenticator.generate(totpSecret)
      })

    return totpRes.json.authentication
  }

  return loginRes.json.authentication
}

async function register ({ email, password }) {
  const res = await frisby
    .post(API_URL + '/Users/', {
      email,
      password,
      passwordRepeat: password,
      securityQuestion: null,
      securityAnswer: null
    }).catch(() => {
      throw new Error(`Failed to register '${email}'`)
    })

  return res
}

describe('/rest/2fa/status', () => {
  it('GET should indicate 2fa is setup for 2fa enabled users', async () => {
    const { token } = await login({
      email: `wurstbrot@${config.get('application.domain')}`,
      password: 'EinBelegtesBrotMitSchinkenSCHINKEN!',
      totpSecret: 'IFTXE3SPOEYVURT2MRYGI52TKJ4HC3KH'
    })

    await frisby.get(
      REST_URL + '/2fa/status',
      {
        headers: {
          'Authorization': 'Bearer ' + token,
          'content-type': 'application/json'
        }
      })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {
        setup: Joi.boolean()
      })
      .expect('json', {
        setup: true
      })
  })

  it('GET should indicate 2fa is not setup for users with 2fa disabled', async () => {
    const { token } = await login({
      email: `J12934@${config.get('application.domain')}`,
      password: '0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB'
    })

    await frisby.get(
      REST_URL + '/2fa/status',
      {
        headers: {
          'Authorization': 'Bearer ' + token,
          'content-type': 'application/json'
        }
      })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {
        setup: Joi.boolean(),
        secret: Joi.string(),
        email: Joi.string(),
        setupToken: Joi.string()
      })
      .expect('json', {
        setup: false,
        email: `J12934@${config.get('application.domain')}`
      })
  })

  it('GET should return 401 when not logged in', async () => {
    await frisby.get(REST_URL + '/2fa/status')
      .expect('status', 401)
  })
})

describe('/rest/2fa/setup', () => {
  it('POST should be able to setup 2fa for accounts without 2fa enabled', async () => {
    const email = 'fooooo1@bar.com'
    const password = '123456'

    const secret = 'ASDVAJSDUASZGDIADBJS'

    await register({ email, password })
    const { token } = await login({ email, password })

    await frisby.post(
      REST_URL + '/2fa/setup',
      {
        headers: {
          'Authorization': 'Bearer ' + token,
          'content-type': 'application/json'
        },
        body: {
          password,
          setupToken: insecurity.authorize({
            secret,
            type: 'totp_setup_secret'
          }),
          initalToken: otplib.authenticator.generate(secret)
        }
      })
      .expect('status', 200)

    await frisby.get(
      REST_URL + '/2fa/status',
      {
        headers: {
          'Authorization': 'Bearer ' + token,
          'content-type': 'application/json'
        }
      })
      .expect('status', 200)
      .expect('jsonTypes', {
        setup: Joi.boolean()
      })
      .expect('json', {
        setup: true
      })
  })

  it('POST should fail if the password doesnt match', async () => {
    const email = 'fooooo2@bar.com'
    const password = '123456'

    const secret = 'ASDVAJSDUASZGDIADBJS'

    await register({ email, password })
    const { token } = await login({ email, password })

    await frisby.post(
      REST_URL + '/2fa/setup',
      {
        headers: {
          'Authorization': 'Bearer ' + token,
          'content-type': 'application/json'
        },
        body: {
          password: password + ' this makes the password wrong',
          setupToken: insecurity.authorize({
            secret,
            type: 'totp_setup_secret'
          }),
          initalToken: otplib.authenticator.generate(secret)
        }
      })
      .expect('status', 401)
  })

  it('POST should fail if the inital token is incorrect', async () => {
    const email = 'fooooo3@bar.com'
    const password = '123456'

    const secret = 'ASDVAJSDUASZGDIADBJS'

    await register({ email, password })
    const { token } = await login({ email, password })

    await frisby.post(
      REST_URL + '/2fa/setup',
      {
        headers: {
          'Authorization': 'Bearer ' + token,
          'content-type': 'application/json'
        },
        body: {
          password: password,
          setupToken: insecurity.authorize({
            secret,
            type: 'totp_setup_secret'
          }),
          initalToken: otplib.authenticator.generate(secret + 'ASJDVASGDKASVDUAGS')
        }
      })
      .expect('status', 401)
  })

  it('POST should fail if the token is of the wrong type', async () => {
    const email = 'fooooo4@bar.com'
    const password = '123456'

    const secret = 'ASDVAJSDUASZGDIADBJS'

    await register({ email, password })
    const { token } = await login({ email, password })

    await frisby.post(
      REST_URL + '/2fa/setup',
      {
        headers: {
          'Authorization': 'Bearer ' + token,
          'content-type': 'application/json'
        },
        body: {
          password,
          setupToken: insecurity.authorize({
            secret,
            type: 'totp_setup_secret_foobar'
          }),
          initalToken: otplib.authenticator.generate(secret)
        }
      })
      .expect('status', 401)
  })
})
