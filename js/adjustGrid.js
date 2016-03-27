(function (w, d) {
  'use strict';

  var filter = function (arrayLike, cb) {
    var i;
    var l = arrayLike.length;
    var item;
    var result = {
      matches: [],
      unmatches: []
    };

    for (i = 0; i < l; i++) {
      item = arrayLike[i];

      if (cb(item, i)) {
        result.matches.push(item);
      } else {
        result.unmatches.push(item);
      }
    }

    return result;
  };

  var adjustGrid = function (elms) {
    var l = elms.length;
    var windowWidth = w.innerWidth;
    var minWidth = 320;
    var col = Math.floor(windowWidth / minWidth);
    var overIndex = l - l % col;
    var filtered = filter(elms, function (elm, i) {
      var isOver = i + 1 > overIndex;
      return isOver;
    });
    var maxWidth = windowWidth / col;

    filtered.matches.forEach(function (elm) {
      elm.style.maxWidth = maxWidth + 'px';
    });
    filtered.unmatches.forEach(function (elm) {
      elm.style.maxWidth = '';
    });
  };

  var debounce = function (fn, delay) {
    var timeout = null;

    return function () {
      var args = arguments;
      var context = this;
      var delayed = function () {
        fn.apply(context, args);
        timeout = null;
      };

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(delayed, delay);
    };
  };

  var init = function () {
    var fn = adjustGrid.bind(null, d.querySelectorAll('.grid-list > li'));
    var debounced = debounce(fn, 300);

    fn();

    w.addEventListener('resize', debounced);
  };

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
