'use strict';
const fs = require('fs');
const request = require('request');
const sortby = require('lodash.sortby');
const jade = require('jade');
const config = require('./config.json');

const API_URL = 'https://getpocket.com/v3/get';

return new Promise(done => {
  request.post({
    url: API_URL,
    form: {
      consumer_key: config.consumer_key,
      access_token: config.access_token,
      tag: config.tag
    }
  }, (err, res, body) => {
    const data = JSON.parse(body);
    const list = sortby(data.list, o => -parseInt(o.time_updated, 10));
    const items = list.map(item => {
      const title = (item.resolved_title || item.given_title)
        .replace('\n', ' ');
      const url = item.resolved_url;
      return {
        title: title.length > 40 ? `${title.substr(0, 40)}...` : title,
        url: url,
        thumbnail: `http://capture.heartrails.com/medium/delay=3?${url}`
      };
    });

    const html = jade.renderFile('src/index.jade', {
      pretty: true,
      items: items
    });
    fs.writeFileSync('dist/index.html', html, 'utf8');

    done();
  });
});
