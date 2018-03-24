'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret ="secret668945";


exports.ensureAuth = function(req,res,next){
        if(!req.headers.authorization){

          return
          res.status(403).send({message: "la peticion no tiene cabecera de auth"});
        }
          let token = req.headers.authorization.replace(/['"]+/g,'');
          try {
            var payload = jwt.decode(token,secret);
            if(payload.exp <= moment().unix()){
              return res.status(403).send({message: "El token ha expirado"});
            }
          } catch (e) {
              return res.status(403).send({message: "El token no es valido"});
          }

            req.user = payload;
            next();
}
