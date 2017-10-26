import { Children, cloneElement, Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { spring, TransitionMotion } from 'react-motion'

const PANEL_SPRING = { stiffness: 350, damping: 28 }

export default class BottomPanel extends Component {
  render () {
    const { children, showContents, style } = this.props
    const child = Children.only(children)

    return (
      <TransitionMotion
        willEnter={this.willEnter}
        willLeave={this.willLeave}
        styles={this.getStyles()}
      >
        {currentStyles => (
          <div
            className={css(styles.bottomPanel)}
            style={{
              ...style,
              pointerEvents: showContents ? 'auto' : 'none',
              backgroundColor: 'transparent'
            }}
          >
            {currentStyles.map(config => {
              return cloneElement(child, {
                key: config.key,
                style: {
                  ...child.props.style,
                  transform: `translate3d(0, ${config.style.y}%, 0)`,
                  opacity: config.style.opacity
                }
              })
            })}
          </div>
        )}
      </TransitionMotion>
    )
  }

  getStyles = () => {
    const { showContents } = this.props

    if (!showContents) {
      return []
    }

    return [
      {
        key: 'contents',
        style: { y: spring(0, PANEL_SPRING), opacity: spring(1, PANEL_SPRING) }
      }
    ]
  };

  willEnter = () => ({ y: 50, opacity: 0 });

  willLeave = () => ({
    y: spring(100, PANEL_SPRING),
    opacity: spring(0, PANEL_SPRING)
  });
}

const styles = StyleSheet.create({
  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'hidden'
  }
})
