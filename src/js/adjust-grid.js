// adjust grid of flexbox

const adjustGrid = list => {
  const gridCols = list.querySelectorAll('li')
  const gridColCount = gridCols.length
  const windowWidth = window.innerWidth
  const minWidth = Number(
    window.getComputedStyle(list.querySelector('li'))
      .minWidth.replace(/px$/, '')
  )
  const colCountPerRow = Math.floor(windowWidth / minWidth)
  const protrudedColCount = gridColCount % colCountPerRow
  const maxWidth = `calc(100% / ${colCountPerRow})`

  for (const col of gridCols) {
    col.style.maxWidth = ''
  }

  for (const col of [...gridCols].slice(- protrudedColCount)) {
    col.style.maxWidth = maxWidth
  }
}

export default adjustGrid
