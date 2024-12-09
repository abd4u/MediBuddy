const jwt = require('jsonwebtoken');
const AppError = require('./appError');

exports.verifyToken = async (req, res, next) => {
  // console.log(req.params.id);
  // console.log('i am being called');
  const token = req.cookies.access_token;
  if (!token) return next(new AppError(401, 'UnAuthorized, Access Denied'));
  // console.log('token is' + token);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(new AppError(401, 'UnAuthorized, Access Denied'));
    }
    console.log('Evyrthing is allright');
    req.user = user;
    next();
  });
};
