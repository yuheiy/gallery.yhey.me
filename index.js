'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const del = require('del');

const fetchList = () => {
  const postAsync = Promise.promisify(require('request').post);
  const config = require('./config.json');
  const sortby = require('lodash.sortby');
  const API_URL = 'https://getpocket.com/v3/get';

  return postAsync({
    url: API_URL,
    form: {
      consumer_key: config.consumer_key,
      access_token: config.access_token,
      tag: config.tag
    }
  }).then(args => {
    const data = JSON.parse(args.body);
    const list = sortby(data.list, o => -parseInt(o.time_updated, 10));

    return list;
  });
};

const renderHTML = list => {
  const jade = require('jade');

  const items = list.map(item => {
    const title = (item.resolved_title || item.given_title)
      .replace(/\n/g, ' ');
    const url = item.resolved_url;

    return {
      title: title,
      url: url,
      thumbnail: `/img/${item.item_id}.png`
    };
  });

  const html = jade.renderFile('src/index.jade', {
    pretty: true,
    items: items
  });

  return fs.writeFileAsync('dist/index.html', html, 'utf8');
};

const renderImages = list => {
  const phantomjs = require('phantomjs');
  const execFileAsync = Promise.promisify(require('child_process').execFile)
  const easyimg = require('easyimage');
  const scriptFile = 'render.js';
  const binPath = phantomjs.path;
  const width = 640;
  const height = 360;
  const limit = 10;

  const targetFiles = list.filter(item => {
    const filePath = `dist/img/${item.item_id}.png`;

    try {
      return !fs.statSync(filePath).isFile();
    } catch (e) {
      return true;
    }
  });

  let i = 0;

  return fs.mkdirsAsync('.tmp').then(() => Promise.map(targetFiles, file => {
    const fileName = `${file.item_id}.png`;
    const filePath = {
      temp: `.tmp/${fileName}`,
      dest: `dist/img/${fileName}`
    };
    const url = file.resolved_url;
    const options = [scriptFile, url, filePath.temp];
    let count;

    return execFileAsync(binPath, options).then(() => {
      count = `[${++i}/${targetFiles.length}]`;
      console.log(`${count} Captured web page`);

      return easyimg.thumbnail({
        src: filePath.temp,
        dst: filePath.dest,
        width: width,
        height: height,
        gravity: 'North'
      });
    }).then(() => console.log(`${count} Generated thumbnail`));
  }, {concurrency: limit})).then(() => fs.removeAsync('.tmp'));
};

const removeUnlistedImages = list => {
  const listedFiles = list.map(item => `${item.item_id}.png`);
  const patterns = ['dist/img/*']
    .concat(listedFiles.map(file => `!dist/img/${file}`));

  return del(patterns);
};

const clean = del.bind(null, ['dist/*', '!dist/.git', '!dist/img']);

clean().then(() => {
  fetchList().then(
    list => Promise.map([
      renderHTML,
      renderImages,
      removeUnlistedImages
    ], promise => promise(list))
  ).then(() => console.log('Finish'));

  fs.copy('static', 'dist');
});
