import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import express from 'express';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';

dotenv.config();

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(
  cors({
    exposedHeaders: config.corsHeaders,
  })
);

app.use(
  bodyParser.json({
    limit: config.bodyLimit,
  })
);

app.get('/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

// connec to db
initializeDb(db => {
  // internal middleware
  app.use(middleware({ config, db }));

  // api router
  app.use('/api', api({ config, db }));

  app.server.listen(process.env.PORT || config.port, () => {
    console.log(`Started on port ${app.server.address().port}`);
  });
});

console.log(`Pulled from dotenv: ${process.env.SUPER_SECRET_PASS}`);

export default app;
