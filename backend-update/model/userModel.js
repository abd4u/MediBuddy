const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Enter Your Name'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please Enter Your Mail'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  address: String,
  password: {
    type: String,
    //required: [false, 'Please Enter Your Password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please Enter Your Password'],
    validate: {
      validator: function (EnteredPassword) {
        return this.password === EnteredPassword;
      },
      message: "Entered PassWord Doesn't Matches",
    },
  },
  dob: {
    type: Date,
   // required: [true, 'Please Enter Your Age'],
  },
  phone: {
    type: Number,
  },
  doctors: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Doctor',
    },
  ],
  insurance: String,
  medicalHistory: [String],
  allergies: [String],
  medications: [String],
  surgeries: [String],
  familyMedicalHistory: [String],
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// userSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'doctors',
//     select: 'name experience clinicName',
//   });
//   next();
// });
const User = mongoose.model('User', userSchema);

module.exports = User;
