// signupModel.js

const db = require("../utils/database");
const { DataTypes } = require("sequelize");

const User = db.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // This is the new column for optimization
  totalExpenses: {
    type: DataTypes.INTEGER, // Or DataTypes.DECIMAL for more precision with money
    defaultValue: 0,
    allowNull: false
  }
});

module.exports = User;
