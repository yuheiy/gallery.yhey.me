(function (w, d) {
  'use strict';

  var adjustGrid = function (elms) {
    var windowWidth = w.innerWidth;
    var minWidth = 320;
    var maxWidth = windowWidth / Math.floor(windowWidth / minWidth);

    Array.prototype.forEach.call(elms, function (elm) {
      elm.style.maxWidth = maxWidth + 'px';
    });
  };

  var init = function () {
    var fn = adjustGrid.bind(null, d.querySelectorAll('.list li'));

    fn();

    w.addEventListener('resize', fn);
  };

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
