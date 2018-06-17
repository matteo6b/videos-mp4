'use strict';
const Video = require('../models/video');

exports.getAll = (req, res) => {
  Video.find()
    .distinct('tags')
    .then(tags => {
      return res.json({ tags: tags });
    });
};
