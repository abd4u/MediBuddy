const express = require('express');
const doctorController = require('./../controller/doctorController');
const doctorAuthController = require('../controller/doctorAuthController');

const router = express.Router();

router.post('/signup', doctorAuthController.signup);

router.post('/login', doctorAuthController.login);

router.post('/logout', doctorAuthController.logout);

router.post('/forgotPassword', doctorAuthController.forgotPassword);

router.patch('/resetPassword/:token', doctorAuthController.resetPassword);

router
  .route('/')
  .post(doctorController.createDoctor)
  .get(doctorController.getAllDoctor);

router
  .route('/:id')
  .get(doctorController.getDoctor)
  .delete(doctorController.deleteDoctor)
  .patch(doctorController.updateDoctor);

module.exports = router;
