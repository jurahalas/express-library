import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import catalogRouter  from './routes/catalog';
import compression from 'compression';
import helmet from 'helmet';

dotenv.config();

const server = express();

server.use(helmet());

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

// view engine setup
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'pug');

server.use(logger('dev'));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(cookieParser());
server.use(compression());

server.use(express.static(path.join(__dirname, 'public')));

server.use('/', indexRouter);
server.use('/users', usersRouter);
server.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
server.use((req, res, next)=> {
  next(createError(404));
});

// error handler
server.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(process.env.PORT || 3000, () => console.log('Running on localhost: 8080'));
