'use strict'
exports.isRole = function(req,res,next){
      if(req.user.role!= 'ROLE_MUSIC'){
        return res.status(200).send({message: 'No tienes acceso a esta zona'});
      }
  next();
}
