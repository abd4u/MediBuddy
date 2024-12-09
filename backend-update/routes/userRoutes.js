const express = require('express');
const userController = require('./../controller/userController');
const authController = require('./../controller/authContoller');

const router = express.Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.post('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);

router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.use(authController.protect);
// router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUser)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.UpdateOneUser)
  .delete(userController.deleteOneUser);

module.exports = router;
