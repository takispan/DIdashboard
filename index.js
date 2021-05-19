const http = require('http');
const csv = require('./csv');
csv.members;

// create server
http.createServer( function( req, res ) {
  res.writeHead( 200, { 'Content-Type': 'text/html' });
  res.write( '<h1>DI Dashboard!</h1>' );
  //res.write( csv.members );
  res.end();
}).listen( 8100 );
