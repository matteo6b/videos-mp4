'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-pagination');
var UserSchema = Schema(
  {
    name: String,
    surname: String,
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true
    },
    password: String,
    role: String,
    image: {
      type: String,
      default: '//placehold.it/150'
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    myvideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
  },
  { usePushEach: true }
);

UserSchema.methods.favorite = function(id) {
  if (this.favorites.indexOf(id) === -1) {
    this.favorites.push(id);
  }

  return this.save();
};

UserSchema.methods.unfavorite = function(id) {
  this.favorites.remove(id);
  return this.save();
};

UserSchema.methods.isFavorite = function(id) {
  return this.favorites.some(function(favoriteId) {
    return favoriteId.toString() === id.toString();
  });
};

UserSchema.methods.myVideoss = function(id) {
  this.myvideos.push(id);
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);
