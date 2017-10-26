import { connect } from 'react-redux'
import WindowState from 'window-state'
import Button from 'ui/Button'
import { Motion } from 'data-driven-motion'
import { css, StyleSheet } from 'aphrodite/no-important'
import { font, mediaQueries } from 'style'

function UpdateNotification ({ style }) {
  return (
    <div className={css(styles.notification)} style={style}>
      <span>
        A new version of Sideway is available.
      </span>
      <Button
        color='brandgreen'
        type='button'
        label='refresh too apply update'
        textOnly
        onClick={() => window.location.reload()}
      >
        <span style={{ fontWeight: 'bold' }}>REFRESH</span>
      </Button>
    </div>
  )
}

export default connect(state => ({
  swUpdateAvailable: state.app.swUpdateAvailable
}))(({ dispatch, swUpdateAvailable }) => {
  return (
    <WindowState>
      {({ winHeight, scrollTop }) => {
        return (
          <Motion
            data={swUpdateAvailable ? [true] : []}
            component={<div />}
            getKey={() => 'notification'}
            render={(key, data, style) => {
              return (
                <UpdateNotification
                  key={key}
                  style={{
                    opacity: style.opacity,
                    transform: `translate3d(${style.x}px, ${style.y}px, 0)`
                  }}
                />
              )
            }}
            onComponentMount={data => ({
              opacity: 0,
              x: -100,
              y: winHeight + scrollTop
            })}
            onRender={(data, i, spring) => ({
              opacity: spring(1),
              x: spring(0),
              y: winHeight - 50 - 16 + scrollTop
            })}
            onRemount={data => ({
              opacity: 0,
              x: -100,
              y: winHeight + scrollTop
            })}
          />
        )
      }}
    </WindowState>
  )
})

const styles = StyleSheet.create({
  notification: {
    ...font.caption,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'fixed',
    top: 8,
    left: 8,
    width: 'calc(100% - 16px)',
    paddingTop: 4,
    paddingRight: 8,
    paddingBottom: 4,
    paddingLeft: 8,
    backgroundColor: '#212529',
    color: '#adb5bd',
    borderRadius: 2,
    zIndex: 9,
    willChange: 'opacity',
    [mediaQueries.phone]: {
      ...font.body2,
      display: 'block',
      top: 0,
      left: 16,
      width: 'auto',
      paddingTop: 8,
      paddingRight: 16,
      paddingBottom: 8,
      paddingLeft: 16
    }
  }
})
