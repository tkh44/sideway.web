import cn from 'classnames'

const SidewayIcon = props => {
  const { style = {} } = props
  const styles = style;

  ['width', 'height'].forEach(p => {
    if (props[p]) {
      styles[p] = props[p]
    }
  })

  return (
    <i
      {...props}
      style={styles}
      className={cn('icon sideway-png-icon', props.className)}
    />
  )
}

export default SidewayIcon
