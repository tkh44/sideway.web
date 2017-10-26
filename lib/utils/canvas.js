export const toBlob = (canvas, type, quality, cb) => {
  return new Promise((resolve, reject) => {
    const binStr = window.atob(canvas.toDataURL(type, quality).split(',')[1])
    const len = binStr.length
    const arr = new Uint8Array(len)

    for (let i = 0; i < len; ++i) {
      arr[i] = binStr.charCodeAt(i)
    }

    resolve(new window.Blob([arr], { type: type || 'image/png' }))
  })
}
