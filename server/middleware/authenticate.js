var {user} = require('./../models/users.js');
var authenticate = (req, res, next) => {
  var token = req.param('token');
  user.findByToken(token).then((u) => {
    if(!u)
      return Promise.reject();
    req.token = token;
    req.user = u;
    next();
  }).catch((err) => {
    res.status(401).send();
  });
};
module.exports = {authenticate};
