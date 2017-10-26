import { Component } from 'react'
import cn from 'classnames'
import { Motion, spring, TransitionMotion } from 'react-motion'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, commonStyles, font, mediaQueries } from 'style'
import Link from 'react-router-dom/es/Link'
import Sitrep from 'sitrep/Sitrep'
import Icon from 'art/Icon'
import TooltipIcon from 'art/TooltipIcon'
import RoomSettingsTooltip from 'room/RoomSettingsTooltip'
import Popover from 'ui/Popover'
import AudienceCount from 'room/AudienceCount'
import StartedDate from 'room/StartedDate'
import ParticipantList from 'room/ParticipantList'
import NavLinks from 'ui/NavLinks'

const SCROLL_SPRING = { stiffness: 400, damping: 28 }
const HEADER_HEIGHT = 64
const SUBHEADER_HEIGHT = 64

const calcMiddleMaxWidth = (wrapperEl, middleEl, padding) => {
  let afterTitle
  let beforeWidth = 0
  let afterWidth = 0

  for (let i = 0; i < wrapperEl.children.length; ++i) {
    const child = wrapperEl.children[i]

    if (child === middleEl) {
      afterTitle = true
      continue
    }

    const childWidth = child.getBoundingClientRect().width
    if (afterTitle) {
      afterWidth += childWidth
      continue
    }

    beforeWidth += childWidth
  }

  return wrapperEl.getBoundingClientRect().width -
    (Math.max(beforeWidth, afterWidth) + padding * 2) * 2
}

class RoomSettingsDetailsItem extends Component {
  render () {
    const {
      canWrite,
      className,
      dispatch,
      isAdmin,
      isOwner,
      isPublic,
      profileId,
      roomActive,
      roomId,
      roomMarkdown,
      roomPending,
      roomTitle,
      roomUI,
      style
    } = this.props

    return (
      <Popover
        className={className}
        style={style}
        component='div'
        topBuffer={0}
        role='button'
        popoverProps={{
          tooltip: 'Conversation Settings'
        }}
        ignoreAttr='data-ignore-popover-close'
      >
        <Popover
          animate={false}
          component='div'
          openOnClick
          openOnMount={false}
          popoverComponent={RoomSettingsTooltip}
          popoverProps={{
            canWrite,
            dispatch,
            profileId,
            roomActive,
            isAdmin,
            isOwner,
            isPublic,
            roomId,
            roomMarkdown,
            roomPending,
            roomTitle,
            roomUI
          }}
          ignoreAttr='data-ignore-popover-close'
        >
          <Icon
            name={isPublic ? 'horn' : 'lock'}
            fill={colors.brandgreen}
            style={{ width: 32, height: 32 }}
          />
        </Popover>
      </Popover>
    )
  }
}

export default class RoomHeader extends Component {
  constructor (props) {
    super(props)

    this.state = {
      subheaderTitleMaxWidth: 0
    }
    this.prevWinWidth = 0
    this.prevScrollTop = window.scrollY
    this.furthestScroll = window.scrollY
    this.resizeAnimationId = null
  }

  componentDidMount () {
    this.handleResize({ winWidth: this.props.winWidth })
  }

  componentWillReceiveProps (nextProps) {
    const { winWidth } = this.props
    const { winWidth: nextWinWidth } = nextProps

    if (winWidth !== nextWinWidth) {
      this.handleResize({ winWidth: nextWinWidth })
    }
  }

  componentWillUnmount () {
    if (this.resizeAnimationId) {
      window.cancelAnimationFrame(this.resizeAnimationId)
    }
  }

  render () {
    const { subheaderTitleMaxWidth } = this.state
    const {
      className,
      headerY,
      roomId,
      scrollTop,
      style,
      title
    } = this.props

    return (
      <Motion style={{ y: spring(headerY, SCROLL_SPRING) }}>
        {currentStyles => {
          return (
            <header
              className={cn('room-header', className, css(styles.header))}
              style={{
                transform: `translate3d(0, ${currentStyles.y}px, 0)`,
                ...style
              }}
            >
              <div className={css(styles.inner)}>
                <Link to='/'>
                  <Icon
                    name='sideway'
                    fill={colors.brandgreen}
                    style={{
                      marginLeft: -8,
                      height: 52,
                      width: 52
                    }}
                  />
                </Link>
                <NavLinks />
              </div>
              <header
                ref={el => {
                  this.subheader = el
                }}
                className={css(styles.subheader)}
              >
                <ParticipantList
                  className={css(styles.participantList)}
                  showDetailsButton
                  roomId={roomId}
                />
                <TransitionMotion
                  willEnter={this.titleWillEnter}
                  willLeave={this.titleWillLeave}
                  styles={
                    scrollTop >
                      160 - HEADER_HEIGHT + SUBHEADER_HEIGHT + headerY &&
                      subheaderTitleMaxWidth > 128
                      ? [
                        {
                          key: 'subheader-title',
                          style: {
                            y: spring(0, SCROLL_SPRING),
                            opacity: spring(1, SCROLL_SPRING)
                          }
                        }
                      ]
                      : []
                  }
                >
                  {currentStyles => {
                    return (
                      <div
                        ref={el => {
                          this.subheaderTitle = el
                        }}
                        className={css(styles.titleContainer)}
                        style={{
                          maxWidth: subheaderTitleMaxWidth
                        }}
                      >
                        {currentStyles.map(config => {
                          return (
                            <div
                              key={config.key}
                              className={css(
                                styles.roomTitle,
                                styles.titleLarge
                              )}
                              style={{
                                transform: `translate3d(0, ${config.style.y}px, 0)`,
                                opacity: config.style.opacity,
                                maxWidth: subheaderTitleMaxWidth
                              }}
                            >
                              {title}
                            </div>
                          )
                        })}
                      </div>
                    )
                  }}
                </TransitionMotion>
                {this.renderPublicIndicator()}
                {this.renderRoomNumbers()}
              </header>
              <Sitrep headerHeight={HEADER_HEIGHT + SUBHEADER_HEIGHT} />
            </header>
          )
        }}
      </Motion>
    )
  }

  renderPublicIndicator () {
    const {
      canWrite,
      dispatch,
      profileId,
      roomActive,
      isAdmin,
      isOwner,
      isPublic,
      roomId,
      roomMarkdown,
      roomPending,
      roomUI,
      title
    } = this.props

    return profileId
      ? <RoomSettingsDetailsItem
        canWrite={canWrite}
        className={css(styles.publicIndicator, styles.clickable)}
        dispatch={dispatch}
        isAdmin={isAdmin}
        isOwner={isOwner}
        isPublic={isPublic}
        roomActive={roomActive}
        roomId={roomId}
        roomMarkdown={roomMarkdown}
        roomPending={roomPending}
        roomTitle={title}
        roomUI={roomUI}
        />
      : <TooltipIcon
        className={css(styles.publicIndicator)}
        name={isPublic ? 'horn' : 'lock'}
        tooltip={isPublic ? 'Public Conversation' : 'Private Conversation'}
        fill={colors.darkgray}
        ignoreAttr='data-ignore-popover-close'
        />
  }

  renderRoomNumbers () {
    const { roomSystem, roomStarted, roomStatus } = this.props

    if (roomStatus === 'completed') {
      return (
        <StartedDate
          className={css(styles.roomStatus)}
          roomStarted={roomStarted}
        />
      )
    }

    return (
      <AudienceCount
        className={css(styles.roomStatus)}
        roomStatus={roomStatus}
        {...roomSystem}
      />
    )
  }

  titleWillEnter = () => ({ y: 30, opacity: 0 });

  titleWillLeave = () => ({
    y: spring(30, SCROLL_SPRING),
    opacity: spring(0, SCROLL_SPRING)
  });

  handleResize = ({ winWidth }) => {
    if (winWidth === this.prevWinWidth) {
      return
    }
    this.prevWinWidth = winWidth
    if (this.resizeAnimationId) {
      window.cancelAnimationFrame(this.resizeAnimationId)
    }
    this.resizeAnimationId = window.requestAnimationFrame(() => {
      if (!this.subheader) {
        this.resizeAnimationId = null
        return
      }

      const maxWidth = calcMiddleMaxWidth(
        this.subheader,
        this.subheaderTitle,
        8
      )
      if (maxWidth !== this.state.subheaderTitleMaxWidth) {
        this.setState({ subheaderTitleMaxWidth: maxWidth })
      }
      this.resizeAnimationId = null
    })
  };
}

const styles = StyleSheet.create({
  header: {
    ...commonStyles.drawnBorder(false, false, true, false, colors.faintgray),
    position: 'fixed',
    top: -1,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: HEADER_HEIGHT + SUBHEADER_HEIGHT,
    width: '100%',
    paddingTop: 0,
    paddingRight: 16,
    paddingBottom: 0,
    paddingLeft: 16,
    backgroundColor: colors.white,
    zIndex: 11
  },
  inner: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    height: HEADER_HEIGHT,
    width: '100%',
    maxWidth: 1028,
    margin: '0 auto'
  },
  subheader: {
    flex: '1',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: SUBHEADER_HEIGHT,
    width: '100%',
    maxWidth: 1028
  },
  participantList: {
    marginLeft: 8
  },
  titleContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    margin: '0 auto',
    overflow: 'hidden'
  },
  roomTitle: {
    ...commonStyles.overflowEllipsis,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    textAlign: 'center'
  },
  titleSmall: {
    ...font.body1
  },
  titleLarge: {
    ...font.title
  },
  publicIndicator: {
    height: 32,
    width: 32,
    marginLeft: 'auto'
  },
  clickable: {
    cursor: 'pointer'
  },
  roomStatus: {
    ...font.caption,
    fontSize: 12,
    marginLeft: 8,
    color: colors.lightgray,
    [mediaQueries.phone]: {
      ...font.body2,
      marginLeft: 16
    }
  }
})
