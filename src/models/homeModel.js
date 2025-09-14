// homeModel.js
const { DataTypes } = require('sequelize');
const db = require('../utils/database');
const User = require('./signupModel'); // import User model

const Expense = db.define('expense', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// ✅ Associations (will auto-create userId column in Expense)
User.hasMany(Expense, { foreignKey: "userId", onDelete: "CASCADE" });
Expense.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

module.exports = Expense;
