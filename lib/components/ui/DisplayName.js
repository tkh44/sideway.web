import { DOM } from 'react'
import Link from 'react-router-dom/es/Link'

export default function DisplayName (
  { user: { username, display = '' }, ...passable }
) {
  if (!display) {
    return DOM.noscript()
  }

  if (!username) {
    return (
      <span {...passable}>
        {display}
      </span>
    )
  }

  return (
    <Link to={`/user/${username}`} {...passable}>
      {display}
    </Link>
  )
}
