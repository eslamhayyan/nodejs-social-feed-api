const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 200 },
  imageUrl: { type: String, required: true },
  content: { type: String, required: true, trim: true, minlength: 5, maxlength: 5000 },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

postSchema.index({ createdAt: -1 });
module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);
