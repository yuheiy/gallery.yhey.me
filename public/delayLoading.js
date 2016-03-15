(function (w, d) {
  'use strict';

  var delayLoading = function (elms) {
    var scrollTop = w.pageYOffset;
    var scrollBottom = scrollTop + w.innerHeight;

    Array.prototype.slice.call(elms)
      .filter(function (elm) {
        var offsetTop = elm.getBoundingClientRect().top + scrollTop;
        return offsetTop > scrollTop && offsetTop < scrollBottom;
      })
      .forEach(function (elm) {
        var preloader = new Image();
        var image = elm.dataset.image;

        preloader.addEventListener('load', function () {
          elm.style.backgroundImage = 'url("' + image + '")';
          elm.style.opacity = 1;
        });
        preloader.src = image;
      });
  };

  var throttle = function (fn, delay) {
    var lastTime = Date.now();
    var timeout = null;

    return function () {
      var args = arguments;
      var context = this;
      var now = Date.now();

      if ((lastTime + delay) <= now) {
        fn.apply(context, args);
        lastTime = now;

        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      } else if (!timeout) {
        timeout = setTimeout(fn.bind(context, args), delay);
      }
    };
  };

  var init = function () {
    var fn = delayLoading.bind(null, d.querySelectorAll('[data-image]'));
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
