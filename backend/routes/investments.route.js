const express = require('express');
const router = express.Router();
const Investment = require('../models/investment.model');

router.post('/', async (req, res) => {
  try {
    const investment = new Investment(req.body);
    await investment.save();
    res.status(201).json(investment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const investments = await Investment.find();
  res.json(investments);
});

module.exports = router;
