'use strict';
const Promise = require('bluebird');
const fs = require('fs');
const mkdirp = require('mkdirp');

const fetchList = () => {
  const postAsync = Promise.promisify(require('request').post);
  const {consumer_key, access_token, tag} = require('./config.json');
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

  mkdirp.sync('dist/');
  return fs.writeFileSync('dist/index.html', htmlString, 'utf8');
};

const fetchOrCopyImages = list => {
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
      height: 1080
    });

    mkdirp.sync('tmp/');
    return addedList.reduce((process, {url, tempPath}) => process
      .goto(url)
      .wait('body')
      .wait(3000)
      .screenshot(tempPath)
    , nightmare)
    .end();
  };
  const resizeImages = () => {
    const easyimg = require('easyimage');
    const width = 640;
    const height = 360;
    const addedFiles = addedList.map(({fileName}) => fileName);
    const targetFiles = fs.readdirSync('tmp/')
    .filter(file => addedFiles.includes(file));

    return targetFiles.reduce((seq, file) => seq.then(() => {
      const {tempPath, destPath, cachePath} = addedList
      .find(({fileName}) => file === fileName);
      return Promise.map([destPath, cachePath], dst => easyimg.thumbnail({
        src: tempPath,
        dst,
        width,
        height,
        gravity: 'North'
      }));
    }), Promise.resolve());
  };
  const copyCache = () => Promise.map(
    cachedList, ({destPath, cachePath}
  ) => new Promise(done => {
    ncp(cachePath, destPath, err => {
      if (err) {
        return console.error(err);
      }
      done();
    });
  }));

  mkdirp.sync('dist/img/');
  mkdirp.sync('cache/');
  return Promise.all([
    fetchScreenShots(addedList).then(resizeImages),
    copyCache()
  ]);
};

const clean = () => {
  const del = require('del');
  return del(['dist/*', '!dist/.git'], {dot: true});
};

const copy = () => {
  const glob = require('glob');
  const {ncp} = require('ncp');
  const {basename} = require('path');
  const files = ['src/css/**', 'src/js/**', 'static/**']
  .map(pattern => glob.sync(pattern, {nodir: true}))
  .reduce((prev, current) => prev.concat(current));

  mkdirp.sync('dist/');
  return Promise.map(files, file => new Promise(done => {
    ncp(file, `dist/${basename(file)}`, err => {
      if (err) {
        return console.error(err);
      }
      done();
    });
  }));
};

clean()
.then(() => Promise.all([
  fetchList()
  .then(list => Promise.map([
    renderHTML,
    fetchOrCopyImages
  ], cb => cb(list))),
  copy()
]))
.then(() => console.log('Finish'));
