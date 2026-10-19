require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter(name => !process.env[name]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters.');
  process.exit(1);
}

const port = Number(process.env.PORT || 8080);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(port, () => console.log(`Social Feed API listening on port ${port}.`)))
  .catch(error => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });
