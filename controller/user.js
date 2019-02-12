const User = require('../models/user.model');
const validator = require('email-validator');
const bcryptjs = require('bcrypt');
const jwt = require('jsonwebtoken');
const { normalizeErrors } = require('../helpers/mongoose_error');
var config = require('../config/keys');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var async = require('async');

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  let fetchedUser;
  if (!password || !email) {
    return res.status(422).send({
      errors: [{ title: 'Data Missing', detail: 'Provide email and passowrd' }]
    });
  }

  User.findOne({ email }, (err, user) => {
    fetchedUser = user;
    if (err) {
      return res.status(422).send({ errors: normalizeErrors(err.errors) });
    }
    if (!user) {
      return res.status(422).send({
        errors: [{ title: 'Invalid user', detail: 'User doesnot exist' }]
      });
    }
    return bcryptjs.compare(password, user.password, (err, result) => {
      if (!result) {
        return res.status(403).send({
          errors: [
            {
              title: 'Invalid Credentials',
              detail: 'Wrong Email or Password'
            }
          ]
        });
      }
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        config.JWT_SECRET,
        { expiresIn: '1hr' }
      );
      return res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: user.id
      });
    });
  });
};

module.exports.create = (req, res) => {
  const { username, email, password } = req.body;
  validEmail = validator.validate(email);

  if (!password || !email) {
    return res.status(422).send({
      errors: [
        { title: 'Data missing!', detail: 'Provide email and password!' }
      ]
    });
  }

  if (!validEmail) {
    return res.status(422).send({
      errors: [{ title: 'Invalid email', detail: 'Enter a valid email!!' }]
    });
  }

  User.findOne({ email }, function(err, existingUser) {
    if (err) {
      return res.status(422).send({ errors: normalizeErrors(err.errors) });
    }

    if (existingUser) {
      return res.status(422).send({
        errors: [
          {
            title: 'Invalid email!',
            detail: 'User with this email already exist!'
          }
        ]
      });
    }

    const user = new User({
      username,
      email,
      password
    });

    user.save(function(err) {
      if (err) {
        return res.status(422).send({ errors: normalizeErrors(err.errors) });
      }
      return res.json({ registered: true });
    });
  });
};

// module.exports.forgot = function(req, res) {
//   async.waterfall(
//     [
//       function(done) {
//         crypto.randomBytes(20, function(err, buf) {
//           var token = buf.toString('hex');
//           done(err, token);
//         });
//       },
//       function(token, done) {
//         User.findOne({ email: req.body.email }, function(err, user) {
//           if (!user) {
//             return res.json({
//               msg: 'No account with that email address exists.'
//             });
//           }

//           user.resetPasswordToken = token;
//           user.resetPasswordExpires = Date.now() + 3600000;

//           user.save(function(err) {
//             done(err, token, user);
//           });
//         });
//       },
//       function(token, user, done) {
//         var smtpTransport = nodemailer.createTransport({
//           service: 'Gmail',
//           auth: {
//             user: 'email',
//             pass: 'password'
//           }
//         });
//         var mailOptions = {
//           to: user.email,
//           from: 'AuthAPI',
//           subject: 'Password Reset',
//           text:
//             'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
//             'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
//             'http://' +
//             req.headers.host +
//             '/reset/' +
//             token +
//             '\n\n' +
//             'If you did not request this, please ignore this email and your password will remain unchanged.\n'
//         };
//         smtpTransport.sendMail(mailOptions, function(err, res) {
//           console.log('mail sent');
//           res.status(200).json({
//             status: 'success',
//             msg:
//               'An e-mail has been sent to ' +
//               user.email +
//               ' with further instructions.'
//           });
//           done(err, 'done');
//         });
//       }
//     ],
//     function(err) {
//       return res.status(422).json({ message: err });
//     }
//   );
// };

module.exports.forgot = function(req, res) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          return res.json({
            msg: 'No account with that email address exists.'
          });
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        user.save(function(err, res) {
          done(err, token, user);
        });
        res.send({ token: token });
      });
    }
  ]);
};
