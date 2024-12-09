const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  reviewText: {
    type: String,
    required: true,
  },
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  this.populate({
    path: 'doctor',
    select: 'name',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
