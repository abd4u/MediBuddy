const express = require('express');
const donorController = require('./../controller/donorController');
const reciepentController=require('./../controller/reciepentController');
const router = express.Router();

router.route('/donate').post(donorController.createDonor);
router.route('/recieve').post(reciepentController.createRecipient);
router.route('/allReciepants').get(reciepentController.getRecipient);
router.route('/allDonors').get(donorController.getDonors);
module.exports=router;