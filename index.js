'use strict';
const Promise = require('bluebird');
const postAsync = Promise.promisify(require('request').post);
const config = require('./config.json');
const fs = Promise.promisifyAll(require('fs'));
const sortby = require('lodash.sortby');
const jade = require('jade');
const phantomjs = require('phantomjs');
const execFileAsync = Promise.promisify(require('child_process').execFile)
const easyimg = require('easyimage');

const fetchList = () => {
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
  const items = list.map(item => {
    const title = (item.resolved_title || item.given_title)
      .replace('\n', ' ');
    const url = item.resolved_url;

    return {
      title: title,
      url: url,
      thumbnail: `./img/${item.item_id}.png`
    };
  });

  const html = jade.renderFile('src/index.jade', {
    pretty: true,
    items: items
  });

  return fs.writeFileAsync('dist/index.html', html, 'utf8');
};

const renderImages = list => {
  const scriptFile = 'render.js';
  const binPath = phantomjs.path;
  const width = 200;
  const height = 150;
  const limit = 10;

  const targetFiles = list.filter(item => {
    const filePath = `dist/img/${item.item_id}.png`;

    try {
      return !fs.statSync(filePath).isFile();
    } catch (e) {
      return true;
    }
  });

  return Promise.map(targetFiles, (file, i) => {
    const fileName = `${file.item_id}.png`;
    const filePath = {
      temp: `.tmp/${fileName}`,
      dest: `dist/img/${fileName}`
    };
    const url = file.resolved_url;
    const options = [scriptFile, url, filePath.temp];
    const count = `[${i + 1}/${targetFiles.length}]`;

    return execFileAsync(binPath, options).then(() => {
      console.log(`${count} Captured web page`);

      return easyimg.thumbnail({
        src: filePath.temp,
        dst: filePath.dest,
        width: width,
        height: height,
        gravity: 'North'
      });
    }).then(() => {
      console.log(`${count} Generated thumbnail`);
      fs.unlinkSync(filePath.temp);
      console.log(`${count} Completed`);
    });
  }, {concurrency: limit});
};

const removeUnlistedImages = list => {
  return fs.readdirAsync('dist/img').then(files => {
    const listedFiles = list.map(item => `${item.item_id}.png`);
    const unlistedFiles = files.filter(
      file => listedFiles.indexOf(file) === -1
    );

    return Promise.map(
      unlistedFiles,
      file => fs.unlinkAsync(`dist/img/${file}`)
    );
  });
};

const copy = dir => {
  return fs.readdirAsync(dir).then(
    files => Promise.map(
      files,
      file => fs.readFileAsync(`${dir}/${file}`, 'utf8').then(
        data => fs.writeFileAsync(`dist/${file}`, data, 'utf8')
      )
    )
  )
};

fetchList().then(
  list => Promise.map([
    renderHTML,
    renderImages,
    removeUnlistedImages
  ], promise => promise(list))
).then(() => console.log('Finish'));

copy('public');
