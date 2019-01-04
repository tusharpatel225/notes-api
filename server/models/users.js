var mongoose = require('mongoose');
var validator = require('validator');
const jwt = require('jsonwebtoken');
const crypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email : {
    type : String,
    minlength : 1,
    require : true,
    unique : true,
    validate : {
      validator : validator.isEmail,
      message : '{VALUE} is not an email'
    }
  },
  password : {
    type : String,
    minlength : 6,
    require : true
  },
  tokens : [{
    token : {
      type : String,
      minlength : 1,
      require : true
    },
    access : {
      type : String,
      require : true
    }
  }]
});

UserSchema.pre("save", function(next){
  var user = this;
  if(user.isModified('password'))
  {
  crypt.genSalt(10, (err, salt) => {
    if(!err){
      crypt.hash(user.password, salt, (e, hash) => {
        if(!e){
          user.password = hash;
          next();
        }
      });
    }
  });
  }
  else {
    next();
  }
});

UserSchema.statics.findByToken = function(token) {
  //console.log("Token schema : ",token);
  var User = this;
  var decoded;
  try{
    decoded = jwt.verify(token, "tusky");
  }catch(e) {
    return Promise.reject();
  }
  return User.findOne({
    '_id' : decoded._id,
    'tokens.token' : token,
    'tokens.access' : "Auth"
  });
};

UserSchema.statics.findByCrerdentials = function(email, password){
  var User = this;
  return User.findOne({email}).then((u) => {
    if(!u)
      return Promise.reject("User not found");
    return new Promise((resolve, reject) => {
      crypt.compare(password, u.password, (err, res) => {
        if(!err&&res)
        {
            resolve(u);
        }
        else {
            reject("password does not match");
        }
    });
  });
  });
};

UserSchema.methods.removeToken = function(token) {
 var User = this;
 return User.updateOne({
   $pull : {
     tokens : {token}
   }
 });

};

UserSchema.methods.toJSON = function(){
  return {_id : this._id, email : this.email};
};

UserSchema.methods.generateAuthToken = function(){

  var User = this;
  var access = "Auth";
  var token = jwt.sign({_id : User._id.toHexString(), access}, "tusky").toString();
  User.tokens.push({token, access});
  return User.save().then(() => {
    return token;
  });
};
var user = mongoose.model('user', UserSchema);
module.exports = {user};
