const loadImage = imagePath => new Promise(resolve => {
  const image = new Image()
  const onLoad = () => {
    image.removeEventListener('load', onLoad)
    resolve(image)
  }
  image.addEventListener('load', onLoad)
  image.src = imagePath
})

const intersectionObserver = new IntersectionObserver(changes => {
  changes
    .filter(({intersectionRatio}) => intersectionRatio)
    .forEach(async ({target}) => {
      intersectionObserver.unobserve(target)

      const {src} = await loadImage(target.dataset.image)
      target.style.backgroundImage = `url("${src}")`
      target.dataset.loaded = 'true'
    })
}, {
  rootMargin: '50%'
})

const lazyLoading = el => intersectionObserver.observe(el)

export default lazyLoading
