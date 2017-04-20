const adjustGrid = list => {
  const windowWidth = window.innerWidth
  const minWidth = 320
  const colCountPerRow = Math.floor(windowWidth / minWidth) || 1

  list.style.setProperty('--col-count-per-row', colCountPerRow)
}

export default adjustGrid
