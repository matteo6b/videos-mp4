
'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../models/user');
// Schema defines how the user's data will be stored in MongoDB
const CommentSchema = new mongoose.Schema({

      title:{
        type:String,
      },
      description:{
        type:String,
      },
      created_at: Date,
      author : { type: Schema.Types.ObjectId, ref: 'User' }



})
CommentSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});
module.exports = mongoose.model('Comment', CommentSchema);
