export const debounce = fn => {
  let scheduledAnimationFrame = false

  return (...args) => {
    if (scheduledAnimationFrame) {
      return
    }

    scheduledAnimationFrame = true
    requestAnimationFrame(() => {
      fn(...args)
      scheduledAnimationFrame = false
    })
  }
}
