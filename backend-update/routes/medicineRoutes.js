const express = require('express');
const medicineController = require('./../controller/medicineController');
const authController = require('./../controller/authContoller');

const router = express.Router();

router
  .route('/')
  .get(medicineController.getAllMedicine)
  .post(medicineController.createMedicine);

router
  .route('/:id')
  .get(medicineController.getOneMedicine)
  .patch(medicineController.UpdateOneMedicine)
  .delete(medicineController.deleteOneMedicine);

module.exports = router;
