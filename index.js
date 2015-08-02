var cluster = require('cluster');
var host = (process.argv[2]) ? process.argv[2] : 'localhost';
var bucketName = (process.argv[3]) ? process.argv[3] : 'default';
var port = (process.argv[4]) ? process.argv[4] : 8000;

// Code to run if we're in the master process
if (cluster.isMaster) {

  // Count the machine's CPUs
  var cpuCount = require('os').cpus().length;

  // Create a worker for each CPU
  for (var i = 0; i < cpuCount; i += 1) {
      cluster.fork();
  }

  // Listen for dying workers
  cluster.on('exit', function (worker) {

      // Replace the dead worker, we're not sentimental
      console.log('Worker ' + worker.id + ' died :(');
      cluster.fork();

  });

// Code to run if we're in a worker process
} else {
  var Hapi = require('hapi');
  var hash = require('object-hash');
  var couchbase = require('couchbase');
  var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
  var bucket = cluster.openBucket(bucketName);

  var server = new Hapi.Server();
  server.connection({
    host: host,
    port: port
  });

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

        bucket.upsert(date.toString(), data, function(err, result) {
          if (err) {
            throw err;
          } else {
            reply( data );
            console.log(data);
          }
        });
      }
    }
  });

  // Start the server
  server.start();
}
