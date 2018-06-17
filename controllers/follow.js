'use strict';
const path = require('path');
const fs = require('fs');
require('mongoose-pagination');

//models
const User = require('../models/user');
const Follow = require('../models/follow');

exports.saveFollow = (req, res) => {
  let params = req.body;
  const follow = new Follow({
    user: req.user.sub,
    followed: params.followed
  });
  follow.save((err, followStored) => {
    if (err)
      return res
        .status(500)
        .send({ message: 'Error al guardar el seguimiento' });

    if (!followStored)
      return res
        .status(404)
        .send({ message: 'el seguimiento no se ha guardado' });

    return res.status(200).send({ follow: followStored });
  });
};

exports.deleteFollow = (req, res) => {
  let userId = req.user.sub;
  let followId = req.params.id;

  Follow.find({ user: userId, followed: followId }).remove(err => {
    if (err)
      return res.status(500).send({ message: 'Error al dejar de seguir' });

    return res.status(200).send({ message: 'El follow se ha eliminado' });
  });
};

exports.getFollowingUsers = (req, res) => {
  let userId = req.user.id;

  if (req.params.id && req.params.page) {
    userId = req.params.id;
  }
  let page = 1;

  if (req.params.page) {
    page = req.params.page;
  } else {
    page = req.params.id;
  }
  let itemsPerPage = 4;

  Follow.find({ user: userId })
    .populate({ path: 'followed' })
    .paginate(page, itemsPerPage, (err, follows, total) => {
      if (err) return res.status(500).send({ message: 'Error en el servidor' });
      if (follows.length == 0)
        return res
          .status(404)
          .send({ message: 'No estas siguiendo a ningun usuario' });
      return res.status(200).send({
        total,
        pages: Math.ceil(total / itemsPerPage),
        follows
      });
    });
};

exports.getFollowedUsers = (req, res) => {
  let userId = req.user.id;

  if (req.params.id && req.params.page) {
    userId = req.params.id;
  }
  let page = 1;

  if (req.params.page) {
    page = req.params.page;
  } else {
    page = req.params.id;
  }
  let itemsPerPage = 4;

  Follow.find({ followed: userId })
    .populate('user')
    .paginate(page, itemsPerPage, (err, follows, total) => {
      if (err) return res.status(500).send({ message: 'Error en el servidor' });
      if (follows.length == 0)
        return res.status(404).send({ message: 'No te sigue  ningun usuario' });
      return res.status(200).send({
        total,
        pages: Math.ceil(total / itemsPerPage),
        follows
      });
    });
};
