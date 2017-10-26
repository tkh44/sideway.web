// ensure if the value of audience count or view count is null that we return 0
const ensureValue = (val = 0) => {
  if (val === null) {
    val = 0
  }

  return val
}

export default function AudienceCount (
  {
    audience = 0,
    className,
    previews = 0,
    roomStatus,
    views = 0
  }
) {
  if (roomStatus !== 'active') {
    if (typeof views === 'number' && views === 0) {
      const count = ensureValue(previews)
      return (
        <div className={className}>
          {`${count} ${count === 1 ? ' preview' : ' previews'}`}
        </div>
      )
    }

    const count = ensureValue(views)
    return (
      <div className={className}>
        {`${count} ${count === 1 ? ' view' : ' views'}`}
      </div>
    )
  }

  const count = ensureValue(audience)
  return (
    <div className={className}>
      {`${count} ${count === 1 ? ' viewer' : ' viewers'}`}
    </div>
  )
}
