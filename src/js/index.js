import adjustGrid from './adjust-grid.js'
import lazyLoading from './lazy-loading.js'
import {debounce} from './utils.js'

{
  const list = document.querySelector('.grid-list')
  const fn = () => adjustGrid(list)

  window.addEventListener('resize', debounce(fn))
  fn()
}

{
  for (const el of document.querySelectorAll('.js-lazy-loading')) {
    lazyLoading(el)
  }
}
