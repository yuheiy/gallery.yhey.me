'use strict';

const loadedElements = new WeakSet();
const maxColHeight = 180;

const preloadImage = url => new Promise(done => {
  const preloader = new Image();
  preloader.addEventListener('load', () => done(url));
  preloader.src = url;
});

const delayLoading = () => {
  const intersectionObserver = new IntersectionObserver(changes => {
    changes
      .filter(({target}) => !loadedElements.has(target))
      .filter(({intersectionRatio}) => Boolean(intersectionRatio))
      .forEach(({target}) => {
        loadedElements.add(target);
        preloadImage(target.dataset.backgroundImage)
          .then(url => {
            target.style.backgroundImage = `url("${url}")`;
            target.style.opacity = 1;
          });
      });
  }, {
    rootMargin: `${maxColHeight}px`
  });

  [...document.querySelectorAll('[data-background-image]')]
    .forEach(el => intersectionObserver.observe(el))
};

module.exports = delayLoading;
