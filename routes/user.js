var express = require('express');
var router = express.Router();
var UserController = require('../controller/user');
var nodemailer = require('nodemailer');
var async = require('async');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

router.post('/login', UserController.login);
router.post('/create', UserController.create);
router.post('/forgot', UserController.forgot);

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne(
        {
          resetPasswordToken: req.params.token,
          resetPasswordExpires: { $gt: Date.now() }
        },
        function(err, user) {
          if (!user) {
            return res.json({
              msg: 'No account with that email address exists.'
            });
          }
          if (req.body.password) {
            bcrypt.genSalt(10, function(err, salt) {
              bcrypt.hash(req.body.password, salt, function(err, hash) {
                user.password = hash;
              });
            });

            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              done(err, user);
            });
            res.send({ msg: 'reset successfull' });
          } else {
            return res.status(422).send({
              message: err
            });
          }
        }
      );
    }
  ]);
});

module.exports = router;
