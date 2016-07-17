(function (w, d) {
  'use strict';

  var delayLoading = function (elms) {
    var scrollTop = w.pageYOffset;
    var scrollBottom = scrollTop + w.innerHeight;

    Array.prototype.slice.call(elms)
      .filter(function (elm) {
        var isLoaded = elm.style.backgroundImage;
        return !isLoaded;
      })
      .filter(function (elm) {
        var offsetTop = elm.getBoundingClientRect().top + scrollTop;
        var isShown = offsetTop > scrollTop && offsetTop < scrollBottom;
        return isShown;
      })
      .forEach(function (elm) {
        var preloader = new Image();
        var src = elm.dataset.backgroundImage;

        preloader.addEventListener('load', function () {
          elm.style.backgroundImage = 'url("' + src + '")';
          elm.style.opacity = 1;
        });
        preloader.src = src;
      });
  };

  var throttle = function (fn, delay) {
    var lastTime = Date.now();
    var timeout = null;

    return function () {
      var args = arguments;
      var context = this;
      var now = Date.now();
      var delayed = function () {
        fn.apply(context, args);
        lastTime = now;
      };

      if ((lastTime + delay) <= now) {
        delayed();

        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      } else if (!timeout) {
        timeout = setTimeout(delayed, delay);
      }
    };
  };

  var init = function () {
    var fn = delayLoading.bind(null, d.querySelectorAll('[data-background-image]'));
    var throttled = throttle(fn, 300);

    fn();

    w.addEventListener('scroll', throttled);
    w.addEventListener('resize', throttled);
  };

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
