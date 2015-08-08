var _ = require('lodash');
var fs = require('fs');
var webdriver = require('browserstack-webdriver');
var querystring = require('querystring');

var user = (process.argv[2]) ? process.argv[2] : '';
var pass = (process.argv[3]) ? process.argv[3] : '';

if (user === '' || pass === '') {
  console.error('Please set user and password');
  process.exit();
}

var testPage = (process.argv[4]) ? process.argv[4] : 'http://localhost:8123/csp';

// Read the file and send to the callback
var browsers = require('./assets/browsersAutomate.json');
var cleanedList = [];

browsers.forEach(function(browser) {
  /**
   * Exclude browsers/devices that routinely produce errors on Browserstack, as
   * well as browsers that are known to not send CSP reports.
   */
  var browserException = ['firefox', 'ie', 'opera'];
  var deviceException = ['iPad 4th Gen'];

  if (!_.includes(browserException, browser.browser) && !_.includes(deviceException, browser.device)) {
    if (!_.findWhere(cleanedList, {browser: browser.browser, browser_version: browser.browser_version})) {
      cleanedList.push(browser);
    }
  }
});

// Input capabilities
var caps = {
  'browserstack.user': user,
  'browserstack.key': pass,
  'browserstack.debug': true
}

cleanedList.forEach(function(browser) {
  var capabilities = _.extend({}, browser, caps);
  var get_vars = querystring.stringify(browser);
  var url = testPage + '?' + get_vars;

  console.log(url);

  try {
    var driver = new webdriver.Builder()
      .usingServer('http://hub.browserstack.com/wd/hub')
      .withCapabilities(capabilities)
      .build();

    driver.get(url);
  } catch(error) {
    console.log(error);
    console.log(browser);
  } finally {
    driver.quit();
  }
});
