'use strict';
const Promise = require('bluebird');
const fs = require('fs');
const mkdirp = require('mkdirp');

const fetchList = () => {
  const postAsync = Promise.promisify(require('request').post);
  const {consumer_key, access_token, tag} = require('../config.json');
  const API_URL = 'https://getpocket.com/v3/get';

  return postAsync({
    url: API_URL,
    form: {
      consumer_key,
      access_token,
      tag
    }
  }).then(({body}) => JSON.parse(body).list);
};

const renderHTML = list => {
  const jade = require('jade');
  const processList = list => {
    const sortby = require('lodash.sortby');
    const result = sortby(
      list, ({time_updated}) => - parseInt(time_updated, 10)
    ).map(({
      resolved_title,
      given_title,
      resolved_url,
      given_url,
      item_id
    }) => ({
      title: (resolved_title || given_title).replace(/\n/g, ' '),
      url: resolved_url || given_url,
      thumbnail: `/img/${item_id}.png`
    }));

    return result;
  };
  list = processList(list);
  const htmlString = jade.renderFile('src/index.jade', {
    pretty: true,
    list
  });

  fs.writeFileSync('dist/index.html', htmlString, 'utf8');
};

const fetchOrCopyImages = list => {
  const {ncp} = require('ncp');
  const processList = list => Object.keys(list).map(key => {
    const {item_id, resolved_id, resolved_url, given_url} = list[key];
    const id = item_id || resolved_id;
    const fileName = `${id}.png`;
    return {
      id,
      url: resolved_url || given_url,
      fileName,
      destPath: `dist/img/${fileName}`,
      tempPath: `tmp/${fileName}`,
      cachePath: `cache/${fileName}`
    };
  });
  list = processList(list);
  const addedList = list.filter(({cachePath}) => {
    try {
      return !fs.statSync(cachePath).isFile();
    } catch (e) {
      return true;
    }
  });
  const cachedList = list.filter(({cachePath}) => {
    try {
      return fs.statSync(cachePath).isFile();
    } catch (e) {
      return false;
    }
  });
  const fetchScreenShots = () => {
    const Nightmare = require('nightmare');
    const nightmare = Nightmare({
      width: 1920,
      height: 1080,
      loadTimeout: 30000,
      show: true
    });
    const easyimg = require('easyimage');
    const width = 640;
    const height = 360;
    const gravity = 'North';

    mkdirp.sync('tmp/');
    return addedList.reduce((promise, {
      url,
      tempPath,
      destPath,
      cachePath
    }) => promise.then(
      () => nightmare
      .goto(url)
      .wait('body')
      .wait(3000)
      .screenshot(tempPath)
    ).then(
      () => Promise.map([destPath, cachePath], dst => easyimg.thumbnail({
        src: tempPath,
        dst,
        width,
        height,
        gravity
      }))
    ).then(() => fs.unlinkSync(tempPath)), Promise.resolve())
    .then(() => {
      fs.rmdirSync('tmp/');
      return nightmare.end();
    }).catch(err => {
      console.error(err);
      return nightmare.end();
    });
  };
  const copyCachedFiles = () => Promise.map(
    cachedList, ({destPath, cachePath}) => new Promise((done, fail) => {
      ncp(cachePath, destPath, err => err ? fail(err) : done());
    })
  );

  ['dist/img/', 'cache/'].forEach(dir => mkdirp.sync(dir));
  return Promise.all([
    fetchScreenShots(),
    copyCachedFiles()
  ]);
};

fetchList()
.then(list => Promise.map([
  renderHTML,
  fetchOrCopyImages
], cb => cb(list)))
.then(() => console.log('Finish'));
