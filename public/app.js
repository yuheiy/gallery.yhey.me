(function () {
  'use strict';

  var adjustGrid = function (elms) {
    var windowWidth = window.innerWidth;
    var minWidth = 320;
    var maxWidth = windowWidth / Math.floor(windowWidth / minWidth);

    Array.prototype.forEach.call(elms, function (elm) {
      elm.style.maxWidth = maxWidth + 'px';
    });
  };

  var delayLoading = function (elms) {
    var scrollTop = window.pageYOffset;
    var scrollBottom = scrollTop + window.innerHeight;

    Array.prototype.slice.call(elms)
      .filter(function (elm) {
        var offsetTop = elm.getBoundingClientRect().top + scrollTop;

        return offsetTop > scrollTop && offsetTop < scrollBottom;
      })
      .forEach(function (elm) {
        var image = elm.dataset.image;
        var preloader = new Image();

        preloader.addEventListener('load', function () {
          elm.style.backgroundImage = 'url(' + image + ')';
          elm.style.opacity = 1;
        });
        preloader.src = image;
      });
  };

  var init = function () {
    adjustGrid = adjustGrid.bind(null, document.querySelectorAll('.list li'));
    delayLoading = delayLoading.bind(
      null,
      document.querySelectorAll('[data-image]')
    );

    adjustGrid();
    delayLoading();

    window.addEventListener('resize', adjustGrid);
    window.addEventListener('scroll', delayLoading);
    window.addEventListener('resize', delayLoading);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
