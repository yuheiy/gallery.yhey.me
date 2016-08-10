'use strict';
const del = require('del');
const clean = () => del(['dist/*', '!dist/.git'], {dot: true});

clean();
