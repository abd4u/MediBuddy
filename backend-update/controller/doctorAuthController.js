const catchAsync = require('./../utils/catchAsync');
const Doctor = require('../model/doctorModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const sendEmail = require('../utils/email');
const AppError = require('./../utils/appError');

const signInToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (doctor, statusCode, res) => {
  const token = signInToken(doctor._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  doctor.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      doctor,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // console.log('Sign Up Function is Called');
  // console.log(
  //   `${req.body.name},${req.body.email},${req.body.password},${req.body.passwordConfirm}`
  // );
  console.log(req.body.password);
  console.log(req.body.confirmPassWord);
  const newDoctor = await Doctor.create({
    consultationFee: req.body.consultationFee,
    degree: req.body.degree,
    modeOfAppointment: req.body.modeOfAppointment,
    summary: req.body.summary,
    workingDays: req.body.workingDays,
    workingTime: req.body.workingTime,
    specialization: req.body.specialization,
    gender: req.body.gender,
    registrationNumber: req.body.registrationNumber,
    registrationCouncil: req.body.registrationCouncil,
    registrationYear: req.body.registrationYear,
    college: req.body.college,
    clinicName: req.body.clinicName,
    address: req.body.address,
    email: req.body.email,
    name: req.body.name,
    confirmPassWord: req.body.confirmPassWord,
    password: req.body.password,
  });
  createSendToken(newDoctor, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists && password is correct
  let doctor = await Doctor.findOne({ email }).select('+password');

  if (!doctor || !(await doctor.correctPassword(password, doctor.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  doctor = await Doctor.findByIdAndUpdate(
    doctor._id,
    { isAvailable: true },
    { new: true, runValidators: true }
  );

  // 3) If everything ok, send token to client
  createSendToken(doctor, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  console.log(req.doctor);

  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentDoctor = await Doctor.findById(decoded.id);
  if (!currentDoctor) {
    return next(
      new AppError(
        'The doctor belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentDoctor.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Doctor recently changed password! Please log in again.',
        401
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.doctor = currentDoctor;
  // console.log(decoded.id);
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.doctor.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ email: req.body.email });
  if (!doctor) {
    return next(
      new AppError('There is no doctor with that email address.', 404)
    );
  }
  const resetToken = doctor.createPasswordResetToken();
  await doctor.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/doctors/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:${resetURL}.\nIf you don't forget your password,please ignore this email!`;
  try {
    await sendEmail({
      email: doctor.email,
      subject: 'Your password reset token(valid for 10 min)',
      message,
    });
    res.status(200).json({
      statu: 'sucess',
      message: 'Token sent to email',
    });
  } catch (err) {
    doctor.passwordResetToken = undefined;
    doctor.passwordResetExpires = undefined;
    await doctor.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const doctor = await Doctor.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!doctor) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  doctor.password = req.body.password;
  doctor.confirmPassWord = req.body.confirmPassWord;
  doctor.passwordResetToken = undefined;
  doctor.passwordResetExpires = undefined;
  await doctor.save();
  createSendToken(doctor, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.doctor.id).select('+password');
  if (
    !(await doctor.correctPassword(req.body.passwordCurrent, doctor.password))
  ) {
    return next(new AppError('Your current password is wron.', 401));
  }
  doctor.password = req.body.password;
  doctor.confirmPassWord = req.body.confirmPassWord;
  await doctor.save();
  createSendToken(doctor, 200, res);
});
