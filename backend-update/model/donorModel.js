// models/Donor.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DonorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bloodType: { type: String, required: true },
  healthHistory: { type: String, required: true },
  //donationHistory: [{ type: Schema.Types.ObjectId, ref: 'BloodDonation' }],
  donationHistory:Date
});

module.exports = mongoose.model('Donor', DonorSchema);