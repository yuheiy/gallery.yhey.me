'use strict';
require('intersection-observer');
const adjustGrid = require('./adjust-grid');
const delayLoading = require('./delay-loading');

const init = () => {
  adjustGrid();
  delayLoading();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
