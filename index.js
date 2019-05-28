const express = require('express');
const cookieParser = require('cookie-parser');
const {rootApi} = require('./Lambda Function1/rootAPI');
const app = express();

app.use(function( req, res, next ) {
  var data = '';
  req.on('data', function( chunk ) {
    data += chunk;
  });
  req.on('end', function() {
    req.body = data;
    next();
  });
});
app.use(cookieParser());

app.use((req, res) => {
  req.httpMethod = req.method;
  rootApi(req, {}, (error, {statusCode, body, headers}, status) => {
    if (!error) {
      Object.entries(headers).forEach(([k, v]) => {
        res.setHeader(k, v);
      })
      res.status(statusCode).json(JSON.parse(body));
    } else {
      console.log({error, status})
      res.status(status).json(result);
    }
  });
});

app.listen(3001, () => console.log('server started'));