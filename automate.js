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
  //No reporting
  {
    'browser' : 'IE',
    'browser_version' : '11.0',
    'os' : 'Windows',
    'os_version' : '8.1',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'IE',
    'browser_version' : '10.0',
    'os' : 'Windows',
    'os_version' : '8',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'IE',
    'browser_version' : '9.0',
    'os' : 'Windows',
    'os_version' : '7',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'Safari',
    'browser_version' : '8.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'Safari',
    'browser_version' : '7.0',
    'os' : 'OS X',
    'os_version' : 'Mavericks',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'Safari',
    'browser_version' : '6.1',
    'os' : 'OS X',
    'os_version' : 'Mountain Lion',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'Safari',
    'browser_version' : '6.0',
    'os' : 'OS X',
    'os_version' : 'Lion',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'Safari',
    'browser_version' : '5.1',
    'os' : 'OS X',
    'os_version' : 'Snow Leopard',
    'resolution' : '1600x1200'
  },

  // Reporting
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
    'browser' : 'Firefox',
    'browser_version' : '39.0',
    'os' : 'Windows',
    'os_version' : '8.1',
    'resolution' : '1024x768'
  },
  {
    'browser' : 'Firefox',
    'browser_version' : '38.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'Firefox',
    'browser_version' : '37.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'Firefox',
    'browser_version' : '36.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'Firefox',
    'browser_version' : '35.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'Firefox',
    'browser_version' : '34.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'Firefox',
    'browser_version' : '33.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'Firefox',
    'browser_version' : '32.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'Firefox',
    'browser_version' : '31.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1600x1200'
  },
  {
    'browser' : 'Firefox',
    'browser_version' : '30.0',
    'os' : 'OS X',
    'os_version' : 'Yosemite',
    'resolution' : '1600x1200'
  },
  {
    'browserName' : 'iPhone',
    'platform' : 'MAC',
    'device' : 'iPhone 5S',
    'version' : '7.0'
  },
  {
    'browserName' : 'iPhone',
    'platform' : 'MAC',
    'device' : 'iPhone 5',
    'version' : '6.1'
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
  },
  {
    'browserName' : 'android',
    'platform' : 'ANDROID',
    'device' : 'Samsung Galaxy Note',
    'version' : '2.3'
  },
  {
    'browserName' : 'android',
    'platform' : 'ANDROID',
    'device' : 'Galaxy S',
    'version' : '2.2'
  }
];

// Input capabilities
var caps = {
  'browserstack.user': user,
  'browserstack.key': pass,
  'browserstack.debug': true
}


var base_url = 'https://www.tollmanz.com/test.html';

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
