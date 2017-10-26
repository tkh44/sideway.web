import { DOM } from 'react'
import cn from 'classnames'

const Username = ({ user: { username = '' }, className }) => {
  if (!username) {
    return DOM.noscript()
  }

  return (
    <div className={cn('username', className)}>
      {username}
    </div>
  )
}

export default Username
