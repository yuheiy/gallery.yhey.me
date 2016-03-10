'use strict';
const fs = require('fs');
const childProcess = require('child_process');
const request = require('request');
const sortby = require('lodash.sortby');
const chunk = require('lodash.chunk');
const config = require('./config.json');
const jade = require('jade');
const phantomjs = require('phantomjs');
const binPath = phantomjs.path;
const easyimg = require('easyimage');

const fetchList = () => {
  return new Promise(done => {
    const API_URL = 'https://getpocket.com/v3/get';

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
      done(list);
    });
  });
};

const renderHTML = list => {
  return new Promise(done => {
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
    fs.writeFile('dist/index.html', html, 'utf8', done);
  });
};

const removeUnlistedImages = list => {
  return Promise.resolve()
    .then(() => {
      return new Promise(done => {
        fs.readdir('dist/img', (err, files) => {
          done(files);
        });
      });
    })
    .then(files => {
      const listedFiles = list.map(item => `${item.item_id}.png`);
      const deletedFiles = files.filter(file =>
        listedFiles.indexOf(file) === -1);

      return Promise.all(deletedFiles.map(file => {
        return new Promise(done => {
          fs.unlink(`dist/img/${file}`, done);
        });
      }));
    })
    .then(() => list);
};

const renderImages = list => {
  const script = 'render.js';
  const width = 200;
  const height = 150;
  const limit = 10;

  const matching = list.filter(item => {
    const filepath = `dist/img/${item.item_id}.png`;

    try {
      return !fs.statSync(filepath).isFile();
    } catch (e) {
      return true;
    }
  });

  return chunk(matching, limit).reduce((sequence, items, outerIndex) => {
    return sequence.then(() => {
      return Promise.all(items.map((item, innerIndex) => {
        const count =
          `[${outerIndex * limit + innerIndex + 1}/${matching.length}]`;
        const filename = `${item.item_id}.png`;
        const filepath = {
          temp: `.tmp/${filename}`,
          dest: `dist/img/${filename}`
        };

        return Promise.resolve()
          .then(() => {
            return new Promise(done => {
              const url = item.resolved_url;
              const options = [script, url, filepath.temp];
              childProcess.execFile(binPath, options, done);
            });
          })
          .then(() => {
            console.log(`${count} Captured web page`);
            return easyimg.thumbnail({
              src: filepath.temp,
              dst: filepath.dest,
              width: width,
              height: height,
              gravity: 'North'
            });
          })
          .then(() => {
            console.log(`${count} Generated thumbnail`);
            fs.unlinkSync(filepath.temp);
            console.log(`${count} Completed`);
          });
      }));
    });
  }, Promise.resolve());
};

const copyFiles = files => {
  return Promise.all(files.map(file => {
    return Promise.resolve()
      .then(() => {
        return new Promise(done => {
          fs.readFile(file.src, 'utf8', (err, data) => done(data));
        });
      })
      .then(data => {
        return new Promise(done => {
          fs.writeFile(file.dest, data, 'utf8', done);
        });
      });
  }));
};

fetchList()
  .then(list => {
    return Promise.all([
      renderHTML(list),
      removeUnlistedImages(list).then(renderImages)
    ]);
  })
  .then(() => console.log('Finish'));

copyFiles([
  {
    src: 'src/style.css',
    dest: 'dist/style.css'
  }, {
    src: 'src/CNAME',
    dest: 'dist/CNAME'
  }
]);
