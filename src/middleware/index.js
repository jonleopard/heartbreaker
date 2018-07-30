import dotenv from 'dotenv';
import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import TwitterTokenStrategy from 'passport-twitter-token';
import User from '../models/User';

dotenv.config();

export default ({ config, db }) => {
  let routes = Router();

  // add middleware here

  // Passport
  passport.use(
    new TwitterTokenStrategy(
      {
        consumerKey: process.env.CONSUMER_KEY,
        consumerSecret: process.env.CONSUMER_SECRET,
        includeEmail: true,
      },
      function(token, tokenSecret, profile, done) {
        User.upsertTwitterUser(token, tokenSecret, profile, function(
          err,
          user
        ) {
          return done(err, user);
        });
      }
    )
  );

  // JWT

  const createToken = function(auth) {
    return jwt.sign(
      {
        id: auth.id,
      },
      'my-secret',
      {
        expiresIn: 60 * 120,
      }
    );
  };

  const generateToken = function(req, res, next) {
    req.token = createToken(req.auth);
    return next();
  };

  const sendToken = function(req, res) {
    res.setHeader('x-auth-token', req.token);
    return res.status(200).send(JSON.stringify(req.user));
  };
  //token handling middleware
  const authenticate = expressJwt({
    secret: 'my-secret',
    requestProperty: 'auth',
    getToken: function(req) {
      if (req.headers['x-auth-token']) {
        return req.headers['x-auth-token'];
      }
      return null;
    },
  });

  return routes;
};
