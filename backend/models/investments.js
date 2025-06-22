const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  type: String,  // e.g., stocks, crypto
  amount: Number,
  date: Date,
  expectedReturn: Number
});

module.exports = mongoose.model('Investment', InvestmentSchema);
