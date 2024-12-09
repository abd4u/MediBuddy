const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A medicine must have a name'],
    unique: true,
  },
  price: {
    type: Number,
    required: [true, 'A medicine sould have price'],
  },
  photo: String,
  keyIngredients: [String],
  indications: [String],
  keyBenefits: [String],
  dosage: String,
  summary: String,
  sideEffect: [String],
  type: 'String',
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
