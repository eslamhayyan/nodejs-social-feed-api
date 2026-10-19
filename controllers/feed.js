const fs = require('node:fs/promises');
const path = require('node:path');
const Post = require('../models/post');
const User = require('../models/user');

const perPage = 2; // Kept at two posts per page for compatibility with the course client.
const removeImage = async imageUrl => {
  if (!imageUrl || !imageUrl.startsWith('images/')) return;
  const imagePath = path.join(__dirname, '..', 'images', path.basename(imageUrl));
  try { await fs.unlink(imagePath); } catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not remove uploaded image:', error.message);
  }
};
const requireText = (value, field) => {
  if (typeof value !== 'string' || value.trim().length < 5 || value.trim().length > 5000) {
    const error = new Error(`${field} must be between 5 and 5000 characters.`);
    error.statusCode = 422;
    throw error;
  }
  return value.trim();
};

exports.getPosts = async (req, res) => {
  const page = Number(req.query.page || 1);
  if (!Number.isInteger(page) || page < 1) {
    return res.status(422).json({ message: 'page must be a positive integer.' });
  }
  const [totalItems, posts] = await Promise.all([
    Post.countDocuments(),
    Post.find().sort({ createdAt: -1, _id: -1 }).skip((page - 1) * perPage).limit(perPage)
      .populate('creator', 'name')
  ]);
  return res.status(200).json({ message: 'Fetched posts successfully.', posts, totalItems });
};

exports.createPost = async (req, res) => {
  if (!req.file) return res.status(422).json({ message: 'An image is required.' });
  const title = requireText(req.body.title, 'title');
  const content = requireText(req.body.content, 'content');
  const user = await User.findById(req.userId).select('name');
  if (!user) {
    await removeImage(`images/${req.file.filename}`);
    return res.status(404).json({ message: 'User not found.' });
  }
  const post = await Post.create({
    title, content, imageUrl: `images/${req.file.filename}`, creator: user._id
  });
  await User.updateOne({ _id: user._id }, { $addToSet: { posts: post._id } });
  return res.status(201).json({
    message: 'Post created successfully.',
    post: { ...post.toObject(), creator: { _id: user._id, name: user.name } }
  });
};

exports.getPost = async (req, res) => {
  const post = await Post.findById(req.params.postId).populate('creator', 'name');
  if (!post) return res.status(404).json({ message: 'Could not find post.' });
  return res.status(200).json({ message: 'Post fetched.', post });
};

exports.updatePost = async (req, res) => {
  const title = requireText(req.body.title, 'title');
  const content = requireText(req.body.content, 'content');
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: 'Could not find post.' });
  if (post.creator.toString() !== req.userId) return res.status(403).json({ message: 'Not authorized.' });

  const oldImage = post.imageUrl;
  post.title = title;
  post.content = content;
  if (req.file) post.imageUrl = `images/${req.file.filename}`;
  await post.save();
  if (req.file) await removeImage(oldImage);
  const creator = await User.findById(req.userId).select('name');
  return res.status(200).json({
    message: 'Post updated.',
    post: { ...post.toObject(), creator: creator ? { _id: creator._id, name: creator.name } : null }
  });
};

exports.deletePost = async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: 'Could not find post.' });
  if (post.creator.toString() !== req.userId) return res.status(403).json({ message: 'Not authorized.' });
  await Post.deleteOne({ _id: post._id });
  await User.updateOne({ _id: req.userId }, { $pull: { posts: post._id } });
  await removeImage(post.imageUrl);
  return res.status(200).json({ message: 'Deleted post.' });
};
