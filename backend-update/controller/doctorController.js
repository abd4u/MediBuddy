const Doctor = require('./../model/doctorModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.createDoctor = catchAsync(async (req, res) => {
  // console.log('i am Inside this');
  const doctor = await Doctor.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: doctor,
    },
  });
});

exports.getAllDoctor = catchAsync(async (req, res) => {
  const features = new APIFeatures(Doctor.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const doc = await features.query;
  // const doc = await Doctor.find();

  res.status(200).json({
    status: 'success',
    noOfDr: doc.length,
    data: {
      doc: doc,
    },
  });
});

exports.getDoctor = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate('reviews');
  res.status(201).json({
    status: 'success',
    data: {
      doc: doctor,
    },
  });
});

exports.updateDoctor = catchAsync(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      doc: doctor,
    },
  });
});

exports.deleteDoctor = catchAsync(async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.status(201).json({
    status: 'success',
  });
});
