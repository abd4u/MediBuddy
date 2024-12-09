const User = require('./../model/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const Review = require('./../model/reviewModel');
const AppError = require('../utils/appError');

exports.createUser = catchAsync(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: user,
    },
  });
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj = obj[el];
  });
  return newObj;
};

exports.getAllUser = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const doc = await features.query;

  res.status(201).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getOneUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  res.status(201).json({
    status: 'success',
    data: {
      data: user,
    },
  });
});

exports.deleteOneUser = catchAsync(async (req, res) => {
  const users = await User.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: {},
  });
});

exports.UpdateOneUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: 'success',
    data: {
      data: user,
    },
  });
});
