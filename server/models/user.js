const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
      type: String, 
      require: true,
      trim: true,
      minlength: 1,
      unique: true,
      validate:{
        validator: validator.isEmail,
        message: '{VALUE} is not a valid email'
      }
    },
    password: {
      type: String, 
      required: true,
      minlength: 6
    },
    tokens: [{
      access:{
        type: String,
        required: true
      },
      token:{
        type: String, 
        required: true
      }
    }]
});

UserSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({_id: user._id.toHexString()}, process.env.JWT_SECRET).toString();
  user.tokens.push({access, token});
  return user.save()
    .then(() => {
      return token;
    });
};

UserSchema.methods.removeToken = function(token) {
  const user = this;
  return user.update({
    $pull:{
      tokens:{
        token
      }
    }
  });
};

UserSchema.statics.findByToken = function(token) {
  let decode;
  try{
    decode = jwt.verify(token, process.env.JWT_SECRET);
  }catch(e){
    return Promise.reject();
  }
  return this.findOne({
    '_id': decode._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function(email, password){
  const User = this;

  return User.findOne({email})
    .then((user) => {
      if(!user)
        return Promise.reject();
      return new Promise((reso, reje) => {
        bcrypt.compare(password, user.password, (err, result) => {
          if(!result)
            return reje();
          reso(user);
        })
      })
    })
}

UserSchema.pre('save', function(next) {
  let user = this;
  if(user.isModified('password')){
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      })
    });
  }else{
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = {
  User
};