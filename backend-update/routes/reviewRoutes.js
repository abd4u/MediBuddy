const express = require('express');
const authContoller = require('./../controller/authContoller');
const reviewController = require('./../controller/reviewController');

const router = express.Router();

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authContoller.protect, reviewController.createReview);

module.exports = router;
