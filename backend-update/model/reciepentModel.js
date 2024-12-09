const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipientSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bloodType: { type: String, required: true },
  medicalCondition: { type: String, required: true },
});

module.exports = mongoose.model('Recipient', RecipientSchema);