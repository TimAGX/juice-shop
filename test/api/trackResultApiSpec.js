const frisby = require('frisby')
const Joi = frisby.Joi

const REST_URL = 'http://localhost:3000/rest'

describe('/rest/track-order/:id', () => {
  it('GET tracking results for the order id', done => {
    frisby.get(REST_URL + '/track-order/5267-f9cd5882f54c75a3')
      .expect('status', 200)
      .expect('json', {})
      .done(done)
  })

  it('GET all orders by injecting into orderId', done => {
    var product = Joi.object().keys({
      quantity: Joi.number(),
      name: Joi.string(),
      price: Joi.number(),
      total: Joi.number()
    })
    frisby.get(REST_URL + '/track-order/%27%20%7C%7C%20true%20%7C%7C%20%27')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data.*', {
        orderId: Joi.string(),
        email: Joi.string(),
        totalPrice: Joi.number(),
        products: Joi.array().items(product),
        eta: Joi.string(),
        _id: Joi.string()
      })
      .done(done)
  })
})
