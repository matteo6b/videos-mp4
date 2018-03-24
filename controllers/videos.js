'use strict'

const fs = require('fs');
const path = require('path');
//models
const Video = require('../models/video');
const User = require('../models/user');
const Follow = require('../models/follow');
exports.playVideo = (req,res) => {
  let videoFile = req.params.videoFile;
  const path = './uploads/videos/'+videoFile;
  const stat = fs.statSync(path)
  const fileSize = stat.size
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)

};

exports.all = (req, res) => {
let user;
   User.findById(req.user.sub).then(function(user){
    if (!user) { return res.sendStatus(401); }

  Video.find({}).sort({'created_at':-1})
  .populate('user')
     .exec()
     .then((videos) => {
       res.json(videos.map(  function(v){

              let video =  v.toJSON()
              video.favorited = user.isFavorite(video._id);

          return video;
        }));
     })
     .catch((err) => {
       res.send('error occured');
     });

 }).catch((err) =>{
    res.send('error ocurred')
 });

};
exports.allFavorites = (req, res) => {

  Video.find({}).sort({'favoritesCount':-1})
  .populate('user')
     .exec()
     .then((videos) => {
       res.json(videos);
     })
     .catch((err) => {
       res.send('error occured');
     });
};
exports.findOne = (req,res) =>{
  Video.findOne({
  _id: req.params.id
}).populate('user')
  .exec().then((video) =>{
      res.json(video)

  }).catch((err) => {
       res.send('error occured');
     });

};

exports.addVideo = (req,res) => {

      if(req.files.video){
        var file_path = req.files.video.path;
        let file_split = file_path.split('/');
      var  filename = file_split[2];
        let ext_split = filename.split('\.');
        let file_ext = ext_split[1];
        if(file_ext=='mp4'){
          const video = new Video({
           title: req.body.title,
           description: req.body.description,
           video_src:filename,
           user:req.user.sub
         });


          User.findById(req.user.sub).then(function(user){
             if (!user) { return res.sendStatus(401); }



         video.save()
           .then(savedVideo =>  user.myVideoss(savedVideo._id).then(function(video){
             res.json({video:video})

           })
             )
           .catch(e => next(e));
           })

        }
        else{
          fs.unlink(file_path, (err) => {
            if(err){
                res.status(200).send({message:'no se ha podido borrar el fichero y extension no valida'});
            }else{
                res.status(200).send({message:'extension no valida'});
            }

          });
        }

      }else{
        res.status(500).send({message:'no uploaded video'});
      }
};

exports.favoriteVideo = (req,res,next) => {

  let videoId = req.params.video;
console.log(req.params.video)
  User.findById(req.user.sub).then(function(user){
    if (!user) { return res.sendStatus(401); }

    return user.favorite(videoId).then(function(){
        return   Video.findOne({
          _id: videoId
        }).then((video) =>{
        return  video.updateFavoriteCount().then(function(video){
            return res.json({video: video});
          });
          })

    });
  }).catch(next);

}
exports.unfavoriteVideo = (req,res,next) => {
  let videoId = req.params.video;
  User.findById(req.user.sub).then(function(user){
    if (!user) { return res.sendStatus(401); }

    return user.unfavorite(videoId).then(function(){
        return   Video.findOne({
          _id: videoId
        }).then((video) =>{
        return  video.updateFavoriteCount().then(function(video){
            return res.json({video: video});
          });
          })

    });
  }).catch(next);

}

exports.timeline = (req,res) =>{
          let page = 1;
          if(req.params.page){
            page = req.params.page;
          }
          let itemsPerPage = 4;
          Follow.find({user:req.user.sub}).populate('followed').exec((err,follows) =>{
            if(err) return res.status(500).send({message:'Error devolver el seguimiento'});
              let followsClean =[];

              follows.forEach((follow) =>{
                followsClean.push(follow.followed)
              })
              Video.find({user:{"$in":followsClean}}).sort({'created_at':-1}).populate('user').paginate('user').paginate(page,itemsPerPage,(err,videos,total)=>{
                  if(err) return res.status(500).send({message:'Error devolver videos'});
                    return res.status(200).send({
                      videos,
                      total,
                    pages:Math.ceil(total/itemsPerPage)
                    })
              })


          })

}
