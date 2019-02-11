var express = require('express');
var router = express.Router();
var UserController = require('../controller/user');
var nodemailer = require('nodemailer');
var async = require('async');

router.post('/login', UserController.login);
router.post('/create', UserController.create);
router.post('/forgot', UserController.forgot);

router.post('/reset/:token', function(req, res) {
  async.waterfall(
    [
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
            if (req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, function(err) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                  req.logIn(user, function(err) {
                    done(err, user);
                  });
                });
              });
            } else {
              return res.status(422).send({
                message: err
              });
            }
          }
        );
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'email',
            pass: 'password'
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'AuthAPI',
          subject: 'Your password has been changed',
          text:
            'Hello,\n\n' +
            'This is a confirmation that the password for your account ' +
            user.email +
            ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          res.status(200).json({
            status: 'success'
          });
          done(err);
        });
      }
    ],
    function(err) {
      return res.status(422).json({ message: err });
    }
  );
});

module.exports = router;
