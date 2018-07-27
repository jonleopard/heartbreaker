import dotenv from 'dotenv';
import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import request from 'request';
import querystring from 'querystring';

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
    res.json({ express: 'Hello From Express' });
  });

  api.route('/health-check').get(function(req, res) {
    res.status(200);
    res.send('Hello World');
  });

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

  return api;
};
