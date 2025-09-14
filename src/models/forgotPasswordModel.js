//src/models/forgotPasswordModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./signupModel');

const ForgotPasswordRequest = sequelize.define('ForgotPasswordRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// ✅ Setup association so Sequelize creates `UserId` column
User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User);

module.exports = ForgotPasswordRequest;
