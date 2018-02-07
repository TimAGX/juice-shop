/* jslint node: true */
module.exports = (sequelize, {INTEGER}) => {
  const BasketItem = sequelize.define('BasketItem', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quantity: INTEGER
  }
    )
  return BasketItem
}
