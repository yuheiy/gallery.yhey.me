(function () {
  'use strict';

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

  window.debounce = debounce;
})();
