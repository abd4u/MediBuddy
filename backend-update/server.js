const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const mongoose = require('mongoose');
const cors = require('cors');

const port = process.env.PORT || 3001;

mongoose
  .connect('mongodb://localhost:27017/hackathon')
  .then((con) => console.log(`DB Connection is successul`));

// Allow requests from all origins
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

// Your API routes
// Example: app.get('/api/v1/doctor', (req, res) => { ... });

app.listen(port, () => console.log(`server is listening at port ${port}`));
