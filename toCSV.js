var _ = require('lodash');
var async = require('async');
var json2csv = require('json-2-csv');
var fs = require('fs');
var bucketName = (process.argv[2]) ? process.argv[2] : 'default';
var chunkSize = (process.argv[3]) ? process.argv[3] : '400';
var couchbase = require('couchbase');
var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
var bucket = cluster.openBucket(bucketName);
var ViewQuery = couchbase.ViewQuery;

var reports = [];
var nullVal = '----';

var baseConfig = {
  'browser': nullVal,
  'browser_version': nullVal,
  'os': nullVal,
  'os_version': nullVal,
  'device': nullVal
};

var baseHeaders = {
  'host': nullVal,
  'user-agent': nullVal,
  'accept': nullVal,
  'accept-language': nullVal,
  'accept-encoding': nullVal,
  'content-length': nullVal,
  'content-type': nullVal,
  'connection': nullVal,
  'cookie': nullVal,
  'referer': nullVal,
  'cache-control': nullVal,
  'origin': nullVal,
  'x-requested-with': nullVal,
  'accept-charset': nullVal,
  'pragma': nullVal,
  'ua-cpu': nullVal
};

var baseReport = {
  'blocked-uri': nullVal,
  'document-uri': nullVal,
  'effective-directive': nullVal,
  'original-policy': nullVal,
  'referrer': nullVal,
  'status-code': nullVal,
  'violated-directive': nullVal,
  'source-file': nullVal,
  'line-number': nullVal,
  'column-number': nullVal,
  'request': nullVal,
  'request-headers': nullVal,
  'document-url': nullVal,
  'script-sample': nullVal
}

var query = ViewQuery.from('dev_csp', 'all').limit(3000);

bucket.query(query, function(err, results) {
  async.each(results, function(result, callback) {
    bucket.get(result.id, function(err, getResult) {
      if (err) {
        console.log(err, result.id);
      }

      // Handle inconsistencies with the data mining from Browserstack
      delete getResult.value.query.resolution;
      delete getResult.value.query.device;

      if (_.has(getResult.value.query, 'version')) {
        getResult.value.query['browser_version'] = getResult.value.query.version;
      }
      delete getResult.value.query.version;

      if (_.has(getResult.value.query, 'browserName')) {
        getResult.value.query.browser = getResult.value.query.browserName;
      }
      delete getResult.value.query.browserName;

      if (_.has(getResult.value.query, 'platform')) {
        getResult.value.query.os = getResult.value.query.platform;
      }
      delete getResult.value.query.platform;

      // Convert x-content-type to content-type
      if (_.has(getResult.value.header, 'x-content-type')) {
        getResult.value.header['content-type'] = getResult.value.header['x-content-type'];
      }
      delete getResult.value.header['x-content-type'];

      // Because I was messing around with something at one point, these key could be in there
      delete getResult.value.query.browser_version36;
      delete getResult.value.query.browser_version30;
      delete getResult.value.query.speed;
      delete getResult.value.query.host_ports;

      if (_.has(getResult.value.body), 'csp-report')) {
        delete getResult.value.body['csp-report'].blah;
      }

      var config = _.extend({}, baseConfig, getResult.value.query);
      var headers = _.extend({}, baseHeaders, getResult.value.header);
      var body = _.extend({}, baseReport, getResult.value.body['csp-report']);

      // Remove new lines in request headers
      body['request-headers'] = body['request-headers'].replace(/(?:\r\n|\r|\n)/g, '');

      //console.log(_.difference(_.keys(getResult.value.query), _.keys(baseConfig)));
      //console.log(_.difference(_.keys(getResult.value.header), _.keys(baseHeaders)));
      //console.log(_.difference(_.keys(getResult.value.body['csp-report']), _.keys(baseReport)));

      var all = {
        config: config,
        headers: headers,
        body: body
      };

      reports.push(all);
      callback();
    });
  }, function(err){
      if (err) {
        console.log(err);
      } else {
        var date = new Date().getTime();
        var dir = './data/' + date + '/';
        fs.mkdir(dir);

        // Save CSV
        json2csv.json2csv(reports, function(err, csv) {
          if (err) {
            console.log(err);
          }

          fs.writeFile(dir + 'reports.csv', csv, function(err) {
              if (err) {
                console.log(err);
              }

              console.log('The file was saved!');
          });
        }, {
          DELIMITER: {
            FIELD: "\t"
          }
        });

        var reportChunks = [];
        var reportsClone = _.clone(reports);

        while (reportsClone.length > 0) {
          reportChunks.push(reportsClone.splice(0, chunkSize));
        };

        reportChunks.forEach(function(items, index) {
          console.log(items.length);
          json2csv.json2csv(items, function(err, csv) {
            if (err) {
              console.log(err);
            }

            fs.writeFile(dir + 'reports-' + index + '.tsv', csv, function(err) {
                if (err) {
                  console.log(err);
                }

                console.log('The file was saved!');
            });
          }, {
            DELIMITER: {
              FIELD: "\t"
            }
          });
        });

        fs.writeFile(dir + 'reports.json', JSON.stringify(reports), function(err) {
          if (err) {
            console.log(err);
          }

          console.log('The file was saved!');
        });
      }

      bucket.disconnect();
  });
});
