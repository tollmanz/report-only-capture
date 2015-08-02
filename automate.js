var _ = require('lodash');
var async = require("async");
var webdriver = require('browserstack-webdriver');
var querystring = require('querystring');

var user = (process.argv[2]) ? process.argv[2] : '';
var pass = (process.argv[3]) ? process.argv[3] : '';

if (user === '' || pass === '') {
  process.exit('Please set user and password');
}

var browsers = [
  {
    'browser' : 'Chrome',
    'browser_version' : '44.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Chrome',
    'browser_version' : '43.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Chrome',
    'browser_version' : '42.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Chrome',
    'browser_version' : '41.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Chrome',
    'browser_version' : '40.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Chrome',
    'browser_version' : '39.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Chrome',
    'browser_version' : '38.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Chrome',
    'browser_version' : '37.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Chrome',
    'browser_version' : '36.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Chrome',
    'browser_version' : '35.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Chrome',
    'browser_version' : '34.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Chrome',
    'browser_version' : '33.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Chrome',
    'browser_version' : '32.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Chrome',
    'browser_version' : '31.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Chrome',
    'browser_version' : '30.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1024x768',
  },
  {
    'browser' : 'Opera',
    'browser_version' : '12.16',
    'os' : 'Windows',
    'os_version' : '8.1',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'Opera',
    'browser_version' : '12.15',
    'os' : 'Windows',
    'os_version' : '8.1',
    'resolution' : '1600x1200'
  },
  {
    'browserName' : 'android',
    'platform' : 'ANDROID',
    'device' : 'Google Nexus 5',
    'version' : '5.0'
  },
  {
    'browserName' : 'android',
    'platform' : 'ANDROID',
    'device' : 'Samsung Galaxy S5',
    'version' : '4.4'
  },
  {
    'browserName' : 'android',
    'platform' : 'ANDROID',
    'device' : 'Samsung Galaxy S4',
    'version' : '4.3'
  },
  {
    'browserName' : 'android',
    'platform' : 'ANDROID',
    'device' : 'Google Nexus 4',
    'version' : '4.2'
  },
  {
    'browserName' : 'android',
    'platform' : 'ANDROID',
    'device' : 'Samsung Galaxy S3',
    'version' : '4.1'
  },
  {
    'browserName' : 'android',
    'platform' : 'ANDROID',
    'device' : 'Google Nexus',
    'version' : '4.0'
  }
];

// Input capabilities
var caps = {
  'browserstack.user': user,
  'browserstack.key': pass,
  'browserstack.debug': true
}


var base_url = 'http://45.55.25.245:8123/csp';

async.each(browsers, function(browser, callback) {
  var capabilities = _.extend({}, browser, caps);
  var get_vars = querystring.stringify(browser);
  var url = base_url + '?' + get_vars;

  console.log(url);

  var driver = new webdriver.Builder().
    usingServer('http://hub.browserstack.com/wd/hub').
    withCapabilities(capabilities).
    build();

  driver.get(url);
  driver.quit();

  callback();
});
