(function (w, d) {
  'use strict';

  var filter = function (arrayLike, cb) {
    var i;
    var l = arrayLike.length;
    var item;
    var result = {
      matched: [],
      unmatched: []
    };

    for (i = 0; i < l; i++) {
      item = arrayLike[i];

      if (cb(item, i)) {
        result.matched.push(item);
      } else {
        result.unmatched.push(item);
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
    var maxWidth = windowWidth / col;
    var filtered = filter(elms, function (elm, i) {
      var isOver = i + 1 > overIndex;
      return isOver;
    });

    filtered.matched.forEach(function (elm) {
      elm.style.maxWidth = maxWidth + 'px';
    });
    filtered.unmatched.forEach(function (elm) {
      elm.style.maxWidth = '';
    });
  };

  var init = function () {
    var fn = adjustGrid.bind(null, d.querySelectorAll('.grid-list > li'));

    fn();

    w.addEventListener('resize', fn);
  };

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
