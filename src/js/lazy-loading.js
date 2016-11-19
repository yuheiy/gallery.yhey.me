const loadImage = src => new Promise(resolve => {
  const image = new Image()
  const onLoad = () => {
    image.removeEventListener('load', onLoad)
    resolve(image)
  }
  image.addEventListener('load', onLoad)
  image.src = src
})

const intersectionObserver = new IntersectionObserver(changes => {
  changes
    .filter(({intersectionRatio}) => intersectionRatio)
    .forEach(async ({target}) => {
      intersectionObserver.unobserve(target)

      const {src} = await loadImage(target.dataset.image)
      target.style.backgroundImage = `url("${src}")`
      target.classList.add('is-loaded')
    })
}, {
  rootMargin: '50%'
})

const lazyLoading = el => intersectionObserver.observe(el)

export default lazyLoading
