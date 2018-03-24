'use strict'
//modules
const bcrypt =require('bcrypt-nodejs');
const fs = require('fs');
const path = require('path');
require ('mongoose-pagination');
//models
const User = require('../models/user');
const Follow = require('../models/follow');
//services
const jwt = require('../services/jwt');


exports.saveUser = (req,res) => {
  console.log(req.body)
    if(!req.body.email || !req.body.password || !req.body.name || !req.body.surname ) {
      res.status(400).json({ success: false, message: 'Please enter data correctly .' });
    } else {
      const newUser = new User({
        email: req.body.email,
        password: req.body.password,
        role:'ROLE_USER',
        image:null,
        name:req.body.name,
        surname:req.body.surname
      });

      bcrypt.hash(req.body.password,null,null,function(err,hash){
        newUser.password = hash;

        newUser.save((err,userStored) => {
          if(err){
              res.status(500).send({message:'error al guardar el usuario'});
          }else{
            if(!userStored){
              res.status(404).send({message:"no se ha registrado el usuario"});
            }
            else{
              res.status(200).send({user:userStored});
            }
          }
        });
      })
    }
    };
  exports.login =  (req,res) => {
        let params = req.body;
          let email = params.email;
          let password = params.password;
        User.findOne({ email: email.toLowerCase() },(err,user) => {
          if(err){
            res.status(500).send({message:'error al comprobar el usuario'});
          }
          else{
              if(user){
                    bcrypt.compare(password,user.password,(err,check) =>{
                      if(check){
                        res.status(200).send({
                          user:user,
                          token: jwt.createToken(user)
                        });

                      }else{
                          res.status(404).send({message:'error en la pasword'});
                      }
                    });

              }else {
                  res.status(404).send({message:'error en el email'});
              }
          }

        })
};

exports.updateUser = (req,res) => {
      let userId = req.params.id;
      let update = req.body;
      delete update.password;
      if(userId != req.user.sub ){
        return res.status(500).send({message:'no tienes permisos'})
      }
      User.findByIdAndUpdate(userId,update, {new:true},(err,userUpdated) =>{
          if(err){
            res.status(500).send({message:"error al actualizar usuario"});
          }else{
            if(!userUpdated){
              res.status(404).send({message:'no se ha podidio actualizar el usuario'});
            }
            else{
              res.status(200).send({user:userUpdated});
            }
          }

      })
};

exports.uploadImage = (req,res) => {
 let userId = req.params.id;

      if(req.files){
        var file_path = req.files.image.path;
        let file_split = file_path.split('/');
      var  filename = file_split[2];
        let ext_split = filename.split('\.');
        let file_ext = ext_split[1];
        if(file_ext=='png ' || file_ext=='jpg' || file_ext=='jpeg' || file_ext=='gif'){
          if(userId != req.user.sub ){
            return res.status(500).send({message:'no tienes permisos'})
          }
          User.findByIdAndUpdate(userId,{image:filename}, {new:true},(err,userUpdated) =>{
              if(err){
                res.status(500).send({message:"error al actualizar usuario"});
              }else{
                if(!userUpdated){
                  res.status(404).send({message:'no se ha podidio actualizar el usuario'});
                }
                else{
                  res.status(200).send({user:userUpdated,image:filename});
                }
              }

          })

        }else{
          fs.unlink(file_path, (err) => {
            if(err){
                res.status(200).send({message:'no se ha podido borrar el fichero y extension no valida'});
            }else{
                res.status(200).send({message:'extension no valida'});
            }

          });

        }

      }else{
        res.status(200).send({message:'no se ha subido imagen'});
      }
};

exports.getImage = (req,res) =>{
      let imageFile = req.params.imageFile;
      var path_file = './uploads/users/'+imageFile;

      fs.exists(path_file,function(exists){

        if(exists){
          res.sendFile(path.resolve(path_file));
        }else{
          res.status(404).send({message:'la imagen no existe'});
        }
      } )

}
exports.profile= (req,res) =>{
  User.findOne({
  _id: req.user.sub
}).populate('favorites').populate('myvideos')
  .exec().then((video) =>{
      res.json(video)

  }).catch((err) => {
       res.send('error occured');
     });

};

exports.findOne = (req,res) =>{
  let userId = req.params.id;
  User.findOne({
  _id: userId
}).populate('favorites').populate('myvideos')
  .exec().then((user) =>{
    user.password=undefined;
      followThisUser(req.user.sub,userId).then((value) =>{
            return res.status(200).send({user,
              following:value.following,
              followed:value.followed
            });

      })



  }).catch((err) => {
       res.send('error occured');
     });

};

async function followThisUser(identityId,userId){
  const following =  await Follow.findOne({user:identityId,followed:userId}).exec((err,follow) =>{
    if(err) handleError(err)

    return follow;

  });
  const followed =  await Follow.findOne({user:userId,followed:identityId}).exec((err,follow) =>{
    if(err) handleError(err)

    return follow;

  });
  return {
    following,
    followed
  }

}
async function folllowUserIds(userId){

  const following = await Follow.find({user:userId}).select({_id:0,__v:0,user:0}).exec((err,follows)=>{


  })
  const followed = await Follow.find({followed:userId}).select({_id:0,__v:0,followed:0}).exec((err,follows)=>{
        let follows_clean =  [];
        follows.forEach((follow) =>{
          follows_clean.push(follow.user);
        })

  })
  let following_clean =  [];
  following.forEach((follow) =>{
    following_clean.push(follow.followed);
  })

  let followed_clean =  [];
  followed.forEach((follow) =>{
    followed_clean.push(follow.user);
  })

  return {
  following:following_clean,
  followed:followed_clean
  }

}

exports.getAll = (req,res) =>{
    let id= req.user.sub;
      let page =1;
      if(req.params.page){
        page = req.params.page;
      }
      let itemsPerPage=5;
      User.find().sort('_id').paginate(page,itemsPerPage, (err,users,total) =>{
        if(err) return res.status(500).send({message:'Error en la peticion'})
        if(users.length==0) return res.status(404).send({message:'No hay usuarios disponibles'})
          folllowUserIds(id).then((value) => {

            return res.status(200).send({
                users,
                total,
                usersFollowing:value.following,
                usersFollowme:value.followed,
                pages:Math.ceil(total/itemsPerPage)
            })

          })


        });

};
