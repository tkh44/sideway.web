import { Component } from 'react'
import { presets, spring, TransitionMotion } from 'react-motion'
import { css, StyleSheet } from 'aphrodite/no-important'
import TranscriptEntryMeta from 'room/TranscriptEntryMeta'
import FormattedText from 'ui/FormattedText'
import { colors, font } from 'style'

const wobble = presets.wobbly

const PendingText = props => {
  const viewBox = '0 0 10 16'

  const rectProps = {
    x: 0,
    y: 6,
    width: 8,
    height: 10,
    rx: 1,
    ry: 1
  }

  return (
    <svg
      className={css(
        styles.pendingTextCharacter,
        props.shouldAnimate && styles.animatedCharacter
      )}
      style={{
        width: props.isSpace ? 4 : 10,
        height: 16,
        ...props.style
      }}
      viewBox={viewBox}
    >
      <rect {...rectProps} />
    </svg>
  )
}

class PreviewPart extends Component {
  render () {
    const { text } = this.props

    return (
      <div className={css(styles.previewPart)}>
        <FormattedText
          text={text}
          hideEmbedOnlyBorder={false}
          removeLinkOnlyText={false}
        />
        <TransitionMotion
          willEnter={this.willEnter}
          willLeave={this.willLeave}
          styles={this.getStyles}
        >
          {currentStyles => {
            return (
              <span>
                {currentStyles.map(config => {
                  return (
                    <PendingText
                      key={config.key}
                      {...config.data}
                      style={{
                        transform: `translate3d(${config.style.x}%, 0, 0)`,
                        fill: `rgba(20, 186, 20, ${config.style.transparency})`
                      }}
                    />
                  )
                })}
              </span>
            )
          }}
        </TransitionMotion>
      </div>
    )
  }

  willEnter = () => ({ x: -100, transparency: 0 });

  willLeave = () => ({
    x: spring(-100, wobble),
    transparency: spring(0, wobble)
  });

  getStyles = previousInterpolatedStyles => {
    const { pending, userId } = this.props

    return new Array(pending).fill(' ').map((_, idx) => {
      const key = `pending--${userId}--${idx}`
      const isSpace = idx === 0 || idx % 7 === 0
      let style = {
        transparency: spring(isSpace ? 0 : 0.27, wobble)
      }

      if (!previousInterpolatedStyles) {
        style.x = spring(0, wobble)
      } else if (idx === 0 || !previousInterpolatedStyles[idx - 1]) {
        style.x = spring(0, wobble)
      } else {
        style.x = previousInterpolatedStyles[idx - 1].style.x
      }

      return {
        key,
        data: {
          shouldAnimate: !isSpace && idx >= pending - 3,
          isSpace
        },
        style
      }
    })
  };
}

const ActivityUpdate = ({ user, activity }) => {
  const text = activity.preview || activity.input

  return (
    <div className={css(styles.update)}>
      <TranscriptEntryMeta user={user} />
      <div className={css(styles.messageText)}>
        <PreviewPart text={text} userId={user.id} pending={activity.pending} />
      </div>
    </div>
  )
}

const styles = StyleSheet.create({
  update: {
    ...font.body1,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 8,
    paddingBottom: 16,
    wordBreak: 'break-word',
    wordWrap: 'break-word'
  },
  messageText: {
    position: 'relative',
    color: colors.fadedgreen
  },
  previewPart: {
    paddingTop: 4,
    paddingRight: 0,
    paddingBottom: 4,
    paddingLeft: 0
  },
  pendingTextCharacter: {
    ':nth-last-child(3)': {
      animationDelay: '0ms'
    },
    ':nth-last-child(2)': {
      animationDelay: '66ms'
    },
    ':nth-last-child(1)': {
      animationDelay: '133ms'
    }
  },
  animatedCharacter: {
    transform: 'scale(1)',
    animationDuration: '3s',
    animationTimingFunction: 'ease',
    animationIterationCount: 'infinite',
    animationName: {
      '0%': {
        transform: 'scale(1)'
      },
      '30%': {
        transform: 'scale(1)'
      },
      '40%': {
        transform: 'scale(1.175)'
      },
      '50%': {
        transform: 'scale(1)'
      },
      '60%': {
        transform: 'scale(1)'
      },
      '70%': {
        transform: 'scale(1.175)'
      },
      '80%': {
        transform: 'scale(1)'
      },
      '100%': {
        transform: 'scale(1)'
      }
    }
  }
})

export default ActivityUpdate
