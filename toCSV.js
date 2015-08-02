var _ = require('lodash');
var async = require('async');
var json2csv = require('json-2-csv');
var fs = require('fs');
var bucketName = (process.argv[2]) ? process.argv[2] : 'default';
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
  'resolution': nullVal,
  'browserName': nullVal,
  'platform': nullVal,
  'device': nullVal,
  'version': nullVal
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
  'cookies': nullVal,
  'x-content-type': nullVal,
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

      var config = _.extend({}, baseConfig, getResult.value.query);
      var headers = _.extend({}, baseHeaders, getResult.value.header);
      var body = _.extend({}, baseReport, getResult.value.body['csp-report']);

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
        json2csv.json2csv(reports, function(err, csv) {
          if (err) {
            console.log(err);
          }

          fs.writeFile('./reports.csv', csv, function(err) {
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
      }

      bucket.disconnect();
  });
});
