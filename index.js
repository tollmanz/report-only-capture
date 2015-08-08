var Hapi = require('hapi');
var Path = require('path');
var querystring = require('querystring');
var handlebars = require('handlebars');

var host = (process.argv[2]) ? process.argv[2] : 'localhost';
var port = (process.argv[3]) ? process.argv[3] : '8123';
var bucketName = (process.argv[4]) ? process.argv[4] : 'default';
var cspPort = (process.argv[5]) ? process.argv[5] : port;
var cspUrl = 'http://' + host + ':' + cspPort + '/csp-report';

var baseDirective = " 'self' https:";

var directivesNames = [
  'default-src',
  'child-src',
  'connect-src',
  'font-src',
  'img-src',
  'media-src',
  'object-src',
  'script-src',
  'style-src',
  'form-action'
];

var directiveString = directivesNames.join(' ' + baseDirective + '; ');
directiveString += ' ' + baseDirective + "; frame-ancestors 'none'; plugin-types 'none';";

var server = new Hapi.Server();
server.connection({
  host: host,
  port: port,
  labels: ['default']
});

server.views({
    engines: {
        html: require('handlebars')
    },
    path: Path.join(__dirname, 'templates')
});

// Configure the cookie
server.state('snickerdoodle', {
  ttl: null,
  isSecure: false,
  isHttpOnly: true,
  encoding: 'none',
  clearInvalid: true,
  strictHeader: true // don't allow violations of RFC 6265
});

// Add the index route
server.route({
  method: 'GET',
  path: '/',
  config: {
    handler: function(request, reply) {
      reply
        .view('index')
        .state('snickerdoodle', 'cinnamon');
    }
  }
});

// Add the route
server.route({
  method: 'GET',
  path:'/csp',
  config: {
    handler: function (request, reply) {
      var getVars = querystring.stringify(request.query);
      var url = (getVars !== '') ? cspUrl + '?' + getVars : cspUrl;

      reply
        .view('csp')
        .state('snickerdoodle', 'cinnamon')
        .header(
          'Content-Security-Policy',
          directiveString + ' report-uri ' + url
        )
        .header(
          'X-Content-Security-Policy',
          directiveString + ' report-uri ' + url
        )
        .header(
          'X-Webkit-CSP',
          directiveString + ' report-uri ' + url
        );
    }
  }
});

// Add the CSP collector
if (port !== cspPort) {
  // Add another port to listen on if needed
  server.connection({
    port: cspPort,
    labels: ['csp-report']
  });
}

server.ext('onRequest', function(request, reply) {
  if ('application/csp-report' === request.headers['content-type']) {
    request.headers['content-type'] = 'application/json';
    request.headers['x-content-type'] = 'application/csp-report';
  }

  return reply.continue();
});

// Add the route
server.route({
  method: 'POST',
  path:'/csp-report',
  config: {
    handler: function (request, reply) {
      var date = new Date().getTime();

      var data = {
        query: request.query,
        date: date,
        header: request.headers,
        body: request.payload
      };

      var couchbase = require('couchbase');
      var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
      var bucket = cluster.openBucket(bucketName);

      bucket.upsert(date.toString(), data, function(err, result) {
        if (err) {
          throw err;
        } else {
          bucket.disconnect();
          console.log(data);
          reply( data );
        }
      });
    }
  }
});

// Start the server
server.start();
