'use strict';
var page = require('webpage').create();
var args = require('system').args;
var url = args[1];
var filename = args[2];

page.viewportSize = {
  width: 1920,
  height: 1080
};

page.open(url, function (status) {
  setTimeout(function () {
    page.render(filename, {
      format: 'png',
      qualify: '100'
    });
    phantom.exit();
  }, 3000);
});
