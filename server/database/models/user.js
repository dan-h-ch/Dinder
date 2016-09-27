var Sequelize = require('sequelize');
// var Promise = require('bluebird');
// var bcrypt = require('bcrypt-nodejs');
var db = require('../database.js');
// var joins = require('../joins.js')

var User = db.define('User', {
  email: {
    type: Sequelize.STRING,
    unique: true
  },
  password: Sequelize.STRING,
  lastGeo: Sequelize.STRING
// },
// {
//   instanceMethods: {
//     comparePassword: function (guess, callback) {
//       bcrypt.compare(guess, this.password, function (err, isMatch) {
//         if (err) {
//           throw err;
//         }
//         callback(null, isMatch);
//       });
//     }
//   }
});

// User.beforeCreate(function (user) {
//   var cipher = Promise.promisify(bcrypt.hash);
//   return cipher(user.password, null, null)
//     .then(function (hash) {
//       user.password = hash;
//     });
// });

module.exports = User;