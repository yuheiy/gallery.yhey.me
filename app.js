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

  var delayLoading = function (elms) {
    var i;
    var l = elms.length;
    var elm;
    var offsetTop;
    var scrollTop = window.pageYOffset;
    var scrollBottom = scrollTop + window.innerHeight;
    var image;

    for (i = 0; i < l; i++) {
      elm = elms[i];
      offsetTop = elm.getBoundingClientRect().top + scrollTop;

      if (offsetTop > scrollTop && offsetTop < scrollBottom) {
        image = elm.dataset.image;
        elm.style.backgroundImage = 'url(' + image + ')';
      }
    }
  };

  var init = function () {
    var images = document.querySelectorAll('[data-image]');
    var adjustGrid = adjustGrid.bind(null, images);
    var delayLoading = delayLoading.bind(null, images);

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
