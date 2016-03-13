(function () {
  'use strict';

  var delayLoading = function (elm) {
    var offsetTop = elm.getBoundingClientRect().top;
    var scrollBottom = window.innerHeight + window.pageYOffset;
    var image;

    if (offsetTop < scrollBottom) {
      image = elm.dataset.image;
      elm.style.backgroundImage = 'url(' + image + ')';
    }
  };

  var init = function () {
    var items = document.querySelectorAll('.list li');
    var fn = function () {
      var i;
      var l = items.length;
      var item;

      for (i = 0; i < l; i++) {
        item = items[i];
        delayLoading(item);
      }
    };

    fn();

    window.addEventListener('scroll', debounce(fn, 300));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
