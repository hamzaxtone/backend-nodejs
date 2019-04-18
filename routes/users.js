const express = require('express');
const router = express.Router();
const Joi = require('joi');

const User = require('../models/user');

//validation schema
const userSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/).required(),
  confirmationPassword: Joi.any().valid(Joi.ref('password')).required()
});

const save = async (result, res) => {
  const hash = await User.hashPassword(result.value.password);
  delete result.value.confirmationPassword;
  result.value.password = hash;

  return new User(result.value).save();
};

router.route('/register').post(async (req, res, next) => {
  try {
    const result = Joi.validate(req.body, userSchema);
    if (result.error) {
      res.status(400).send({
        'error': 'Data entered is not valid. Please try again.'
      });
    }

    const user = User.findOne({
      'email': result.value.email
    }).then((user) => {
      if (user && user._id) {
        res.status(400).send({
          'error': 'Email is already in use.',
          'user': user._id
        });
        return;
      }

      save(result).then((data) => {
        res.status(200).send({
          'success': 'Registration successfully, go ahead and login.',
          'data': {
            '_id': data._id,
            'username': data.username,
            'email': data.email
          }
        });
      });

    }).catch((e) => {
      throw e;
    });

  } catch (error) {
    res.status(500).send({
      'error': error.message
    });
  }
});

router.post('/login', (req, res, next) => {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/users/profile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

// GET route after registering
router.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.send({
            'username': user.username,
            'email': user.email
          });
        }
      }
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;