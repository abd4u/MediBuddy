const Recipient = require('../model/reciepentModel');
const User = require('../model/userModel');

exports.createRecipient = async (req, res,next) => {
  try {
    const user = await User.findById(req.body.userId);
    console.log('No Error');
    console.log(req.body);
    if (!user) {
        console.log('Yes I am Eror');
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('No Error');
    const recipient = new Recipient(req.body);
    await recipient.save();
    res.status(201).json(recipient);
  } catch (error) {
    next(error)
  }
};

exports.getRecipient = async (req, res, next) => {
    try {
      const user = await Recipient.find();
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };