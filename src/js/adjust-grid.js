'use strict';
// adjust grid of flexbox
const range = require('lodash.range');

const adjustGrid = () => {
  const list = document.querySelector('.grid-list');
  const maxGridCols = list.children.length;
  const documentFragment = document.createDocumentFragment();

  range(maxGridCols).forEach(() => {
    const dummy = document.createElement('li');
    dummy.classList.add('dummy');
    documentFragment.appendChild(dummy);
  });

  list.appendChild(documentFragment);
};

module.exports = adjustGrid;
