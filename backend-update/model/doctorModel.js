const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

const doctorSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default:
        'https://tse3.mm.bing.net/th?id=OIP.LczXdrMkR1M0DA0Q6diejQHaIH&pid=Api&P=0&h=180',
    },
    name: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      // required: true,
    },
    password: {
      type: String,
      required: [true, 'Please Enter ur Password'],
      // minlength: 8,
      // maxlength: 12,
    },
    confirmPassWord: {
      type: String,
      required: [true, 'Please Enter Your Password'],
      validate: {
        validator: function (currPass) {
          return this.password === currPass;
        },
        message: "Entered passWord Doesn't Matches",
      },
    },
    email: {
      type: String,
      //required: [true, 'a Doctor Must Have a Email'],
      unique: true,
      validate: [validator.isEmail, 'Please provide valid Email'],
    },
    address: {
      type: String,
      // required: true,
    },
    clinicName: {
      type: String,
      required: true,
    },
    consultationFee: {
      type: Number,
      // required: true,
    },
    rating: {
      type: Number,
      default: 5,
    },
    isAvailable: {
      type: Boolean,
      // required: true,
      default: false,
    },
    degree: {
      type: String,
      // required: true,
    },
    isVerified: {
      type: Boolean,
      // required: true,
    },
    modeOfAppointment: {
      type: String,
      // required: true,
    },
    summary: {
      type: String,
      // required: true,
    },
    workingDays: {
      type: [String],
      default: 'Monday to Saturday',
    },
    workingTime: {
      type: String,
    },
    specialization: {
      type: [String],
      //required: true,
    },
    gender: {
      type: String,
      //required: true,
      enum: ['Male', 'Female', 'Other'],
    },
    registrationNumber: {
      type: String,
      //required: true,
      // minlength: 20,
      // maxlength: 20,
    },
    registrationCouncil: {
      type: String,
      // required: true,
    },
    registrationYear: {
      type: Number,
      // required: true,
    },
    college: {
      type: String,
      // required: true,
    },
    userReviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserReviews',
      },
    ],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

doctorSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//virtual populate
doctorSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'doctor',
  localField: '_id',
});

doctorSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

doctorSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

doctorSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

doctorSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.confirmPassWord = undefined;
  next();
});

doctorSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
