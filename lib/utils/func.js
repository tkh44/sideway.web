export const clamp = (n, min, max) => Math.max(Math.min(n, max), min)

export const noop = (...args) => {
  if (__DEVELOPMENT__ && args) {
    console.log(...args.filter(Boolean))
  }
}

// tl;dr ...set the duration of a spring animation
export const configw = (sec, overdamping) => {
  const s = overdamping <= 0
    ? 1 - overdamping
    : 1 /
        Math.sqrt(
          1 +
            Math.pow(2 * Math.PI / Math.log(1 / (overdamping * overdamping)), 2)
        )

  const ks = 2 * Math.PI / sec / Math.max(Math.sqrt(1 - s * s), 0.5)
  const c = 2 * ks * s

  return [ks * ks, c]
}
