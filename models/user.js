const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  status: { type: String, default: 'I am new!', maxlength: 160 },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
