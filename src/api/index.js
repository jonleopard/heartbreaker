import dotenv from 'dotenv';
import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import passport from 'passport';
import TwitterTokenStrategy from 'passport-twitter-token';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import request from 'request';
import mongoose from 'mongoose';
const User = mongoose.model('User');

dotenv.config();

export default ({ config, db }) => {
  let api = Router();

  // mount the facets resource
  api.use('/facets', facets({ config, db }));

  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    res.json({ version });
  });

  api.route('/hello').get(function(req, res) {
    res.status(200);
    res.send({ express: 'Hello From Express' });
  });

  api.route('/health-check').get(function(req, res) {
    res.status(200);
    res.send('Hello World');
  });

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

  api.route('/auth/twitter/reverse').post(function(req, res) {
    request.post({
      url: 'https://api.twitter.com/oauth/request_token',
      oauth: {
        oauth_callback: 'http%3A%2F%2Flocalhost%2Fsign-in-with-twitter%2F',
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
      },
    });
    var jsonStr =
      '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
    res.send(JSON.parse(jsonStr));
  });

  api.route('/auth/twitter').post(
    (req, res, next) => {
      request.post(
        {
          url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
          oauth: {
            consumer_key: process.env.CONSUMER_KEY,
            consumer_secret: process.env.CONSUMER_SECRET,
            token: req.query.oauth_token,
          },
          form: { oauth_verifier: req.query.oauth_verifier },
        },
        function(err, r, body) {
          if (err) {
            return res.send(500, { message: err.message });
          }

          const bodyString =
            '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
          const parsedBody = JSON.parse(bodyString);

          req.body['oauth_token'] = parsedBody.oauth_token;
          req.body['oauth_token_secret'] = parsedBody.oauth_token_secret;
          req.body['user_id'] = parsedBody.user_id;

          next();
        }
      );
    },
    passport.authenticate('twitter-token', { session: false }),
    function(req, res, next) {
      if (!req.user) {
        return res.send(401, 'User Not Authenticated');
      }

      // prepare token for API
      req.auth = {
        id: req.user.id,
      };

      return next();
    },
    generateToken,
    sendToken
  );

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

  const getCurrentUser = function(req, res, next) {
    User.findById(req.auth.id, function(err, user) {
      if (err) {
        next(err);
      } else {
        req.user = user;
        next();
      }
    });
  };

  const getOne = function(req, res) {
    var user = req.user.toObject();

    delete user['twitterProvider'];
    delete user['__v'];

    res.json(user);
  };

  api.route('/auth/me').get(authenticate, getCurrentUser, getOne);

  return api;
};
