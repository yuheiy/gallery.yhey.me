const preloadImage = url => new Promise(done => {
  const preloader = new Image()
  const onLoad = () => {
    preloader.removeEventListener('load', onLoad)
    done()
  }
  preloader.addEventListener('load', onLoad)
  preloader.src = url
})

const intersectionObserver = new IntersectionObserver(changes => {
  changes
    .filter(({intersectionRatio}) => intersectionRatio)
    .forEach(async ({target}) => {
      intersectionObserver.unobserve(target)

      const url = target.dataset.image
      await preloadImage(url)

      target.style.backgroundImage = `url("${url}")`
      target.style.opacity = 1
    })
}, {
  rootMargin: `25%`
})

const lazyLoading = el => intersectionObserver.observe(el)

export default lazyLoading
