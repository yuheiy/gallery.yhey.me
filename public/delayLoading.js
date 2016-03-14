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
        var image = elm.dataset.image;
        var preloader = new Image();

        preloader.addEventListener('load', function () {
          elm.style.backgroundImage = 'url("' + image + '")';
          elm.style.opacity = 1;
        });
        preloader.src = image;
      });
  };

  var init = function () {
    var fn = delayLoading.bind(null, d.querySelectorAll('[data-image]'));

    fn();

    w.addEventListener('scroll', fn);
    w.addEventListener('resize', fn);
  };

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
