import dotenv from 'dotenv';
import { Router } from 'express';
import passport from 'passport';
import TwitterTokenStrategy from 'passport-twitter-token';
import mongoose from 'mongoose';
const User = mongoose.model('User');

dotenv.config();

export default ({ config, db }) => {
  let routes = Router();

  // add middleware here

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

  return routes;
};
