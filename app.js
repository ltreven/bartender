require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const logger       = require('morgan');
const path         = require('path');
const cors         = require('cors');

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// ADD CORS SETTINGS HERE TO ALLOW CROSS-ORIGIN INTERACTION:
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3001', 'http://localhost:3000'] // <== aceptar llamadas desde este dominio
  })
);


// ROUTES MIDDLEWARE STARTS HERE:
const index = require('./routes/index');
const webhook = require('./routes/webhook')
app.use('/', index)
app.use('/api/webhook', webhook)

module.exports = app;
