const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  source: String,
  amount: Number,
  date: Date,
  description: String
});

module.exports = mongoose.model('Income', IncomeSchema);
