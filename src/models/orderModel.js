// models/orderModel.js

const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");
const User = require("./signupModel");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Association (very important!)
User.hasMany(Order, {
  foreignKey: { allowNull: false }, // ensures no orphan orders
  onDelete: "CASCADE",
});
Order.belongsTo(User);

console.log("📦 Order model initialized with fields: id, orderId, status");
console.log("🔗 Associations set: User.hasMany(Order), Order.belongsTo(User)");

module.exports = Order;
