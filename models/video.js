'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../models/user');
// Schema defines how the user's data will be stored in MongoDB
const VideoSchema = new mongoose.Schema({

      title:{
        type:String,
      },
      description:{
        type:String,
      },
      video_src:{
        type:String,
      },
      favoritesCount: {
        type: Number,
         default: 0
      },

      created_at: Date,
      user : { type: Schema.Types.ObjectId, ref: 'User' },
      comments:[{ type: Schema.Types.ObjectId, ref: 'Comment' }],


})
VideoSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

VideoSchema.methods.updateFavoriteCount = function() {
    let  video= this;
  return User.count({favorites: {$in: [video._id]}}).then(function(count){
      video.favoritesCount = count;

    return video.save();
  });
};
VideoSchema.methods.addComments = function(id){
  this.comments.push(id);
  return this.save();
};

module.exports = mongoose.model('Video', VideoSchema);
