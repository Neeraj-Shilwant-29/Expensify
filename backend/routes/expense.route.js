const express = require('express');
const router = express.Router();
const Expense = require('../models/expense.model');

router.post('/', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const expenses = await Expense.find();
  res.json(expenses);
});

module.exports = router;
