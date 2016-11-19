// adjust grid of flexbox

const adjustGrid = list => {
  const gridCols = list.querySelectorAll('li')
  const gridColCount = gridCols.length
  const windowWidth = window.innerWidth
  const minWidth = 320
  const colCountPerRow = Math.floor(windowWidth / minWidth)
  const startIndexOfProtrudedCol = gridColCount - (gridColCount % colCountPerRow)
  const maxWidth = `calc(100% / ${colCountPerRow})`

  for (const col of gridCols) {
    col.style.maxWidth = ''
  }

  for (const col of [...gridCols].slice(startIndexOfProtrudedCol)) {
    col.style.maxWidth = maxWidth
  }
}

export default adjustGrid
