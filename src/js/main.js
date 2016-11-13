import {debounce} from './utils.js'
import adjustGrid from './adjust-grid.js'
import lazyLoading from './lazy-loading.js'

require('intersection-observer')

{
  const list = document.querySelector('.grid-list')
  const fn = () => adjustGrid(list)

  window.addEventListener('resize', debounce(fn))
  fn()
}

{
  for (const el of document.querySelectorAll('[data-image]')) {
    lazyLoading(el)
  }
}
