// adjust grid of flexbox

const adjustGrid = list => {
  const gridCols = list.children
  const gridColCount = gridCols.length
  const windowWidth = window.innerWidth
  const minWidth = Number(
    window.getComputedStyle(gridCols[0]).minWidth.replace(/px$/, '')
  )
  const colCountPerRow = Math.floor(windowWidth / minWidth)

  list.style.setProperty('--col-count-per-row', colCountPerRow)
}

export default adjustGrid
