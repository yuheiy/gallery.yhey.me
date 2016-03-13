(function () {
  'use strict';

  var adjustGrid = function (elms) {
    var i;
    var l = elms.length;
    var elm;
    var windowWidth = window.innerWidth;
    var minWidth = 320;
    var maxWidth = windowWidth / Math.floor(windowWidth / minWidth);

    for (i = 0; i < l; i++) {
      elm = elms[i];
      elm.style.maxWidth = maxWidth + 'px';
    }
  };

  var init = function () {
    var items = document.querySelectorAll('.list li');

    adjustGrid = adjustGrid.bind(null, items);

    adjustGrid();

    window.addEventListener('resize', debounce(adjustGrid, 300));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
