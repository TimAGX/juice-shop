const models = require('../models/index')
const insecurity = require('../lib/insecurity')

module.exports.upgradeToDeluxe = function upgradeToDeluxe () {
  return async (req, res, next) => {
    const user = await models.User.update({ role: insecurity.roles.deluxe }, { where: { id: req.body.UserId, role: insecurity.roles.customer } })
    if (user[0] !== 0) {
      res.status(200).json({ status: 'success', data: { confirmation: 'Congratulations, you are now a deluxe customer.' } })
    } else {
      res.status(400).json({ status: 'error', error: 'Please try again.' })
    }
  }
}

module.exports.deluxeMembershipStatus = function deluxeMembershipStatus () {
  return (req, res, next) => {
    if (insecurity.isCustomer(req)) {
      res.status(200).json({ status: 'success', data: { membershipCost: 49 } })
    } else if (insecurity.isDeluxe(req)) {
      res.status(400).json({ status: 'error', error: 'You are already a deluxe customer.' })
    } else {
      res.status(400).json({ status: 'error', error: 'You are not eligible for deluxe membership.' })
    }
  }
}
