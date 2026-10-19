const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
const emailRule = body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail();
const passwordRule = body('password').isString().isLength({ min: 8, max: 128 })
  .withMessage('Password must contain between 8 and 128 characters.');
const nameRule = body('name').isString().trim().isLength({ min: 2, max: 80 })
  .withMessage('Name must contain between 2 and 80 characters.');

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) return res.status(422).json({ message: 'Validation failed.', data: result.array() });
  return next();
};

router.put('/signup', emailRule, passwordRule, nameRule, validate, authController.signup);
router.post('/login', emailRule, body('password').isString().notEmpty(), validate, authController.login);
router.get('/status', isAuth, authController.getUserStatus);
router.patch('/status', isAuth, body('status').isString().trim().isLength({ min: 1, max: 160 }), validate, authController.updateUserStatus);

module.exports = router;
