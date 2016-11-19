'use strict'

const fs = require('fs')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const {ncp} = require('ncp')
const Promise = require('bluebird')
const sortby = require('lodash.sortby')
const pug = require('pug')

const fetchList = () => {
  const postAsync = Promise.promisify(require('request').post)
  const config = require('../config.json')
  const API_URL = 'https://getpocket.com/v3/get'

  return postAsync({
    url: API_URL,
    form: {
      consumer_key: config.consumerKey,
      access_token: config.accessToken,
      tag: config.tag
    }
  })
    .then(({body}) => JSON.parse(body).list)
}

const renderHtml = list => {
  list = sortby(list, ({time_updated}) => - Number(time_updated))
    .map(({
      resolved_title,
      given_title,
      resolved_url,
      given_url,
      item_id,
    }) => ({
      title: (resolved_title || given_title).replace(/\n/g, ' '),
      url: resolved_url || given_url,
      thumbnail: `/thumbnail/${item_id}.png`,
    }))

  const result = pug.renderFile('src/index.pug', {
    pretty: true,
    list
  })

  fs.writeFileSync('dist/index.html', result, 'utf8')
}

const fetchScreenShots = list => {
  if (!list.length) {
    return
  }

  const Nightmare = require('nightmare')
  const nightmare = Nightmare({
    width: 1920,
    height: 1080,
    loadTimeout: 10000,
    show: true
  })
  const easyimg = require('easyimage')
  const width = 640
  const height = 360
  const gravity = 'North'

  mkdirp.sync('.tmp/')
  mkdirp.sync('.cache/')

  return list.reduce((seq, {
    url,
    tempPath,
    destPath,
    cachePath,
  }, i) => {
    return seq
      .then(() => nightmare
        .goto(url)
        .wait('body')
        .wait(3000)
        .screenshot(tempPath)
      )
      .then(() => easyimg.thumbnail({
        src: tempPath,
        dst: destPath,
        width,
        height,
        gravity
      }))
      .then(() => Promise.all([
        new Promise(done => ncp(destPath, cachePath, done)),
        new Promise(done => rimraf(tempPath, done))
      ]))
  }, Promise.resolve())
    .then(() => {
      rimraf.sync('.tmp/')
      return nightmare.end()
    })
    .catch(err => {
      console.error(err)
      return nightmare.end()
    })
}

const copyFiles = list =>
  Promise.all(
    list.map(({destPath, cachePath}) => new Promise(done => ncp(cachePath, destPath, done)))
  )

const fetchOrCopyImages = list => {
  list = Object.keys(list).map(key => {
    const {item_id, resolved_id, resolved_url, given_url} = list[key]
    const id = item_id || resolved_id
    const fileName = `${id}.png`

    return {
      id,
      url: resolved_url || given_url,
      fileName,
      destPath: `dist/thumbnail/${fileName}`,
      tempPath: `.tmp/${fileName}`,
      cachePath: `.cache/${fileName}`
    }
  })
  const addedList = list.filter(({cachePath}) => !fs.existsSync(cachePath))
  const cachedList = list.filter(({cachePath}) => fs.existsSync(cachePath))

  mkdirp.sync('dist/thumbnail')

  return Promise.all([
    fetchScreenShots(addedList),
    copyFiles(cachedList)
  ])
}

fetchList()
  .then(list => Promise.all([
    renderHtml(list),
    fetchOrCopyImages(list)
  ]))
  .then(() => console.log('Finish'))
