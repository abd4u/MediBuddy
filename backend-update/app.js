const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const doctorRouter = require('./routes/doctorRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const medicineRouter = require('./routes/medicineRoutes');
const bloodRouter=require('./routes/bloodRoutes');

const app = express();
const corsOptions = {
  origin: 'http://localhost:5173', // Frontend URL
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.options('*', cors());
app.use(cors(corsOptions));

app.use(cookieParser());

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,please try again in an hour!',
});

app.use('/api', limiter);

app.use(express.json());
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [],
  })
);

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

app.use('/api/v1/doctors', doctorRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/medicine', medicineRouter);
app.use('/api/v1/blood',bloodRouter);

app.all('*', (req, res, next) => {
  console.log('generic Function is called');
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
