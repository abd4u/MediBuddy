const Medicine = require('./../model/medicineModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createMedicine = catchAsync(async (req, res) => {
  const meds = await Medicine.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: meds,
    },
  });
});

exports.getAllMedicine = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Medicine.find(), req.query)
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

exports.getOneMedicine = catchAsync(async (req, res) => {
  const med = await Medicine.findById(req.params.id);

  res.status(201).json({
    status: 'success',
    data: {
      data: med,
    },
  });
});

exports.deleteOneMedicine = catchAsync(async (req, res) => {
  const med = await Medicine.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: {},
  });
});

exports.UpdateOneMedicine = catchAsync(async (req, res) => {
  const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: 'success',
    data: {
      data: med,
    },
  });
});
