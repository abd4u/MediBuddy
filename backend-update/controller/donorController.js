const Donor = require('../model/donorModel');
const User = require('../model/userModel');

exports.createDonor = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);
    console.log(req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log("till here no error");
    const donor = new Donor(req.body);
    await donor.save();
    res.status(201).json(donor);
  } catch (error) {
    console.log('There is some error');
    next(error);
  }
};

exports.getDonors = async (req, res, next) => {
    try {
      const Donors = await Donor.find();
      res.status(201).json(Donors);
    } catch (error) {
      next(error);
    }
  };