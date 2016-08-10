'use strict';
// adjust grid of flexbox
const debounce = require('lodash.debounce');

const adjustGrid = cols => {
  cols = Array.from(cols);
  const gridCols = cols.length;
  const windowWidth = window.innerWidth;
  const minWidth = 320;
  const gridColsPerRow = Math.floor(windowWidth / minWidth);
  const startIndexOfProtrudedCol = gridCols - (gridCols % gridColsPerRow);
  const maxWidth = windowWidth / gridColsPerRow;

  // reset style of all elements
  cols
  .filter(el => !!el.style.maxWidth)
  .forEach(el => el.style.maxWidth = '');

  // set style of target elements
  cols
  .filter((el, i) => (i + 1) > startIndexOfProtrudedCol)
  .forEach(el => el.style.maxWidth = `${maxWidth}px`);
};

module.exports = () => {
  const cols = document.querySelectorAll('.grid-list > li');
  const fn = adjustGrid.bind(null, cols);

  fn();
  window.addEventListener('resize', debounce(fn, 150));
};
