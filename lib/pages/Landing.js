import sidewayMediumVideo from 'public/video/whiskey-medium-export.mp4'
import sheepBgTileUrl from 'public/images/bg/sheep-tile.png'
import sheepBgLeftUrl from 'public/images/bg/sheep-left.png'
import shedBgRightUrl from 'public/images/bg/shed-right.png'
import shedBgTileUrl from 'public/images/bg/shed-tile.png'
import zibbyHeadshotUrl from 'public/images/landing/headshots/zibby.jpg'
import foxworthHeadshotUrl from 'public/images/landing/headshots/foxworth.jpg'
import fieldBgUrl from 'public/images/bg/wheat-tile.png'
import pathBgUrl from 'public/images/bg/wheat-right.png'
import stepOneUrl from 'public/images/landing/step-1.png'
import stepTwoUrl from 'public/images/landing/step-2.png'
import stepThreeUrl from 'public/images/landing/step-3.png'

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Player from '@vimeo/player'
import { connect } from 'react-redux'
import isMobile from 'ismobilejs'
import Link from 'react-router-dom/es/Link'
import { Motion, spring } from 'react-motion'
import RotatingText from 'react-rotating-text'
import pure from 'recompose/pure'
import WindowState from 'window-state/es/index'
import StandardPage from 'ui/StandardPage'
import Footer from 'ui/Footer'
import Icon from 'art/Icon'
import { css, StyleSheet } from 'aphrodite/no-important'
import Button from 'ui/Button'
import NavLinks from 'ui/NavLinks'
import { breakpoints, colors, commonStyles, font, mediaQueries } from 'style'
import { clamp, configw } from 'utils/func'
import { scrollToPos, getScrollPos } from 'utils/dom'
import listen from 'simple-listen'

const WHEAT_RATIO = 845 / 680
const SHEEP_RATIO = 548 / 680
const SHED_RATIO = 862 / 680

const [stiffness, damping] = configw(1, 0)
const SCROLL_SPRING = { stiffness, damping, precision: 1 }
const STIFF_SPRING = { stiffness: 320, damping: 30 }

function Spacer ({ height = 1, border = true }) {
  const s = { height }
  if (border === false) {
    s.border = 'none'
  }
  return <div className={css(styles.spacer)} style={s} />
}

function LandingHeader () {
  return (
    <header className={css(styles.header)}>
      <div className={css(styles.headerInner)}>
        <Link to={'/'} style={{ height: '100%' }}>
          <Icon
            name='logo'
            className={css(styles.headerLogo)}
            fill={colors.brandgreen}
          />
        </Link>
        <NavLinks />
      </div>
    </header>
  )
}

class Video extends Component {
  componentDidMount () {
    this.keyListener = listen(document, 'keydown', ({ keyCode }) => {
      if (keyCode === 27 && this.props.isOpen) {
        this.props.handleCloseClick()
      }
    })

    this.player = new Player('promo-video')
  }

  componentDidUpdate (prevProps) {
    if (this.props.isOpen === true && prevProps.isOpen === false) {
      scrollToPos(0)
      document.body.classList.add('scroll-lock')
      this.player.play()
    } else if (this.props.isOpen === false && prevProps.isOpen === true) {
      document.body.classList.remove('scroll-lock')
      this.player.pause()
    }
  }

  componentWillUnmount () {
    document.body.classList.remove('scroll-lock')
    this.keyListener()
  }

  render () {
    const {
      handleCloseClick,
      isOpen,
      startPosRect: rect,
      winWidth,
      winHeight
    } = this.props
    const xScale = spring(isOpen ? 1 : rect.width / winWidth, STIFF_SPRING)
    const yScale = spring(isOpen ? 1 : rect.height / winHeight, STIFF_SPRING)
    const xDelta = spring(isOpen ? 0 : rect.left, STIFF_SPRING)
    const yDelta = spring(isOpen ? 0 : rect.top, STIFF_SPRING)

    return (
      <Motion
        style={{
          xScale,
          yScale,
          xDelta,
          yDelta,
          opacity: spring(isOpen ? 1 : 0)
        }}
      >
        {currentStyles => {
          return (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100vh',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                background: colors.offwhite,
                zIndex: 20,
                opacity: currentStyles.opacity,
                pointerEvents: isOpen ? 'initial' : 'none',
                transformOrigin: '0 0 0',
                transform: `matrix(${currentStyles.xScale}, 0, 0, ${currentStyles.yScale}, ${currentStyles.xDelta}, ${currentStyles.yDelta})`
              }}
              onClick={handleCloseClick}
            >
              <Button
                style={{
                  position: 'fixed',
                  top: 16,
                  right: 8
                }}
                iconOnly
                onClick={handleCloseClick}
                label='Close Video'
                tooltip='Close Video'
              >
                <Icon
                  name='close'
                  fill={colors.brandgreen}
                  style={{
                    height: 36,
                    width: 36
                  }}
                />
              </Button>

              <div
                style={{
                  flex: '1',
                  position: 'relative',
                  width: '100%'
                }}
              >
                <div className={css(styles.videoPaddingHackBlock)} />
                <div
                  ref={node => {
                    this.vimeo = node
                  }}
                  className={'landing-page-video-iframe'}
                  id='promo-video'
                  data-vimeo-id='211248438'
                  data-vimeo-defer
                  height='auto'
                  frameBorder='0'
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                    maxWidth: 'calc(100% - 16px)',
                    top: 0,
                    right: 8,
                    bottom: 0,
                    left: 8
                  }}
                />

              </div>
            </div>
          )
        }}
      </Motion>
    )
  }
}

class VideoContainer extends Component {
  state = {
    buttonRect: { top: 0, right: 0, bottom: 0, left: 0, height: 0, width: 0 }
  };

  componentDidMount () {
    this.trackButtonPos()
  }

  render () {
    const {
      winHeight,
      winWidth
    } = this.props

    return (
      <section
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: 'auto',
          // maxHeight: 1080 - 80,
          margin: '16px auto',
          paddingLeft: 8,
          paddingRight: 8,
          zIndex: 2,
          ...this.props.style
        }}
      >
        <Button
          style={{
            background: 'none'
          }}
          iconOnly
          label='Play Video'
          tooltip='Play Video'
          onClick={() => {
            this.trackButtonPos()
            this.props.onVideoOpenClick()
          }}
        >
          <Icon
            ref={node => {
              this.playButton = node
            }}
            name='play'
            fill={colors.brandgreen}
            style={{
              height: 'calc((350px + 1vh + 1vw) / 3)',
              width: 'calc((350px + 1vh + 1vw) / 3)'
            }}
          />
        </Button>
        <Video
          isOpen={this.props.videoModalOpen}
          handleCloseClick={() => {
            this.trackButtonPos()
            this.props.onVideoModalRequestClose()
          }}
          startPosRect={this.state.buttonRect}
          winHeight={winHeight}
          winWidth={winWidth}
        />
      </section>
    )
  }

  trackButtonPos () {
    if (this.playButton) {
      this.setState({
        buttonRect: ReactDOM.findDOMNode(
          this.playButton
        ).getBoundingClientRect()
      })
    }
  }
}

const CallToAction = connect()(function CallToAction ({
  dispatch,
  index,
  style
}) {
  return (
    <section
      className={css(styles.row, styles.gridRow, styles.callToActionWrapper)}
      style={style}
    >
      <Button
        style={{
          margin: '0 auto',
          minWidth: 300,
          maxWidth: 300
        }}
        color='solidGreenButton'
        label='Start Your Conversation Now'
        data-ga-on={'click'}
        data-ga-event-category={'landing'}
        data-ga-event-action={'sign-up-click'}
        data-ga-event-value={index}
        onClick={() => {
          dispatch({
            type: 'modal/SHOW',
            payload: {
              modal: 'login',
              data: { nextState: window.location.pathname, hideUsername: true }
            }
          })
        }}
      >
        <span
          style={{
            height: 32,
            lineHeight: '32px',
            fontWeight: 'bold'
          }}
        >
          Start Your Conversation Now
        </span>
      </Button>
      <p className={css(styles.noCommitmentReq)}>
        No commitment or CC required
      </p>
    </section>
  )
})

function Blockquote ({ quoteText, attributionText, headshotUrl }) {
  return (
    <section className={css(styles.blockQuoteWrapper)}>
      <blockquote
        style={{
          display: 'block',
          width: '100%',
          marginBottom: 8
        }}
      >
        <Icon
          name={'quotes'}
          fill={colors.darkgray}
          style={{
            flex: 'none',
            marginRight: 4,
            marginBottom: -2,
            width: 'calc((84px + 1vh + 1vw) / 3)',
            height: 'calc((84px + 1vh + 1vw) / 3)',
            transform: 'rotate(180deg)'
          }}
        />
        <span
          style={{
            paddingTop: 8,
            paddingLeft: 0
          }}
        >
          {quoteText}
        </span>
        <Icon
          name={'quotes'}
          fill={colors.darkgray}
          style={{
            marginBottom: -2,
            marginLeft: 4,
            width: 'calc((42px + 1vh + 1vw) / 3)',
            height: 'calc((42px + 1vh + 1vw) / 3)'
          }}
        />
      </blockquote>
      {attributionText &&
        <div className={css(styles.quoteAttribution)}>
          {attributionText}
          <div
            className={css(styles.quoteHeadshot)}
            style={{
              backgroundImage: `url(${headshotUrl})`
            }}
          />
        </div>}
    </section>
  )
}

function WheatBackground ({ wheatPathWidth, y, opacity }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        zIndex: -1,
        opacity: clamp(opacity, 0, 1),
        contain: 'strict'
      }}
    >
      <FieldBg right={wheatPathWidth} y={y} />
      <PathBg width={wheatPathWidth} y={y} />
    </div>
  )
}

const FieldBg = pure(({ right, y }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        right: `${right - 1}px`,
        height: '100%',
        width: '100%',
        backgroundImage: `url(${fieldBgUrl})`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'auto 50%',
        backgroundPosition: `bottom ${-y}px right`,
        backgroundAttachment: isMobile.apple.device ? 'scroll' : 'fixed'
      }}
    />
  )
})

const PathBg = pure(({ y }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        height: '100%',
        width: '100%',
        backgroundImage: `url(${pathBgUrl})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'auto 50%',
        backgroundPosition: `bottom ${-y}px right`,
        backgroundAttachment: isMobile.apple.device ? 'scroll' : 'fixed'
      }}
    />
  )
})

const HeroSection = (
  {
    onLearnMore,
    scrollTop,
    winHeight,
    winWidth,
    videoModalOpen,
    onVideoOpenClick,
    onVideoModalRequestClose
  }
) => {
  const wheatPathHeight = winHeight / 2
  const wheatPathWidth = WHEAT_RATIO * wheatPathHeight
  const y = isMobile.any ? 0 : scrollTop * -0.65

  return (
    <div
      style={{
        height: '100%',
        width: '100%'
      }}
    >
      <div className={css(styles.heroTextContainer)}>
        <h1
          style={{
            marginBottom: 16,
            fontWeight: 'bold',
            paddingLeft: 8,
            paddingRight: 8
          }}
        >
          {'The '}
          <RotatingText
            cursor={false}
            pause={2000}
            emptyPause={0}
            typingInterval={16.6666}
            deletingInterval={8.3333}
            items={[
              'publisher',
              'podcaster',
              'blogger',
              'marketer',
              'manager',
              'interviewer'
            ]}
          />
          {"'s\nsecret weapon\n"}
        </h1>
        <h2
          style={{
            fontSize: '62.5%',
            color: colors.midgray,
            paddingTop: 16,
            paddingLeft: 8,
            paddingBottom: 16,
            paddingRight: 8
          }}
        >
          {
            'Turn your real-time chat conversations into useful content that you can '
          }
          <span className={css(styles.heroCopyAwesome)}>
            save, share & publish.
          </span>
        </h2>
        <VideoContainer
          videoModalOpen={videoModalOpen}
          onVideoOpenClick={onVideoOpenClick}
          onVideoModalRequestClose={onVideoModalRequestClose}
          winHeight={winHeight}
          winWidth={winWidth}
        />
        <div style={{ width: '100%' }}>
          <Button
            style={{
              margin: '64px auto 16px',
              minWidth: winWidth > breakpoints.phone ? 256 : 196
            }}
            color='solidGreenButton'
            label='See How It Works'
            onClick={onLearnMore}
          >
            <span
              className={css(styles.learnMore)}
              style={{
                height: winWidth > breakpoints.phone ? 30 : 24,
                lineHeight: winWidth > breakpoints.phone ? '30px' : '24px',
                fontWeight: 'bold'
              }}
            >
              See How It Works
            </span>
          </Button>
        </div>

      </div>
      <WheatBackground
        opacity={1}
        winHeight={winHeight}
        winWidth={winWidth}
        y={y}
        wheatPathWidth={wheatPathWidth}
        wheatPathHeight={wheatPathHeight}
      />
    </div>
  )
}

class ShedBackground extends Component {
  render () {
    const { winHeight } = this.props
    const shedPathHeight = Math.min(480, winHeight / 2)
    const shedPathWidth = SHED_RATIO * shedPathHeight

    return (
      <div
        ref={node => {
          this.el = node
        }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: shedPathHeight,
          width: '100%',
          zIndex: -1,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: shedPathWidth - 1,
            height: '100%',
            width: '100%',
            backgroundImage: `url(${shedBgTileUrl})`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: `auto ${shedPathHeight}px`,
            backgroundPosition: 'bottom 0 right'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            height: '100%',
            width: '100%',
            backgroundImage: `url(${shedBgRightUrl})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `auto ${shedPathHeight}px`,
            backgroundPosition: 'bottom 0 right'
          }}
        />
      </div>
    )
  }
}

function SheepBackground ({ winHeight }) {
  const sheepPathHeight = Math.min(680, (winHeight - 64) / 2)
  const sheepPathWidth = SHEEP_RATIO * sheepPathHeight

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: sheepPathHeight,
        maxHeight: 680,
        width: '100%',
        zIndex: -1,
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: sheepPathWidth - 1,
          height: '100%',
          width: '100%',
          backgroundImage: `url(${sheepBgTileUrl})`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%',
          backgroundPosition: 'bottom 0 left'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '100%',
          width: '100%',
          backgroundImage: `url(${sheepBgLeftUrl})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'auto 100%',
          backgroundPosition: '0 0'
        }}
      />
    </div>
  )
}

class WindowScrollSink extends Component {
  static defaultProps = { distance: 0 };

  componentDidUpdate (prevProps) {
    if (this.props.distance === 0) {
      return
    }

    if (prevProps.distance !== this.props.distance) {
      scrollToPos(this.props.distance)
    }
  }

  render () {
    return null
  }
}

export default class Landing extends Component {
  static defaultProps = {};

  state = {
    targetScrollTop: 0,
    enableScrollManager: false,
    videoModalOpen: false
  };

  mediumExportVideo = null;

  handleVideoModalOpenClick = () => {
    this.setState(() => ({ videoModalOpen: true }))
  };

  handleVideoModalRequestClose = () => {
    this.setState(() => ({ videoModalOpen: false }))
  };

  componentDidMount () {
    this.mediumExportVideo.play()
  }

  scrollToFirstSection = e => {
    this.setState(prev => ({
      enableScrollManager: true,
      targetScrollTop: this.firstSection.getBoundingClientRect().top +
        2 +
        getScrollPos() // hide border
    }))
  };

  render () {
    return (
      <WindowState includeScrollbars={false} children={this.renderContent} />
    )
  }

  renderContent = ({ winHeight, winWidth, scrollTop }) => {
    const { targetScrollTop } = this.state
    const { style } = this.props

    return (
      <StandardPage
        header={LandingHeader}
        footer={Footer}
        maxWidth='auto'
        contentMarginTop={64}
        contentMarginBottom={0}
        horizontalPadding={false}
        style={{
          ...style
        }}
      >
        <Motion
          style={{
            distance: spring(targetScrollTop, SCROLL_SPRING)
          }}
          onRest={() => {
            this.setState({ enableScrollManager: false, targetScrollTop: 0 })
          }}
        >
          {currentStyles => {
            return this.state.enableScrollManager &&
              currentStyles.distance > 1 &&
              <WindowScrollSink distance={currentStyles.distance} />
          }}
        </Motion>
        <SheepBackground winHeight={winHeight} />
        <section
          style={{
            position: 'relative',
            height: 'calc(100vh - 64px)',
            width: '100%',
            paddingTop: 32,
            paddingRight: 0,
            paddingBottom: 16,
            paddingLeft: 0,
            overflow: 'hidden'
          }}
        >
          <HeroSection
            onLearnMore={this.scrollToFirstSection}
            winWidth={winWidth}
            winHeight={winHeight}
            scrollTop={scrollTop}
            videoModalOpen={this.state.videoModalOpen}
            onVideoOpenClick={this.handleVideoModalOpenClick}
            onVideoModalRequestClose={this.handleVideoModalRequestClose}
          />
        </section>
        <div
          ref={node => {
            this.firstSection = node
          }}
          style={{
            position: 'relative',
            width: '100%',
            marginTop: 0,
            opacity: 1,
            borderTop: `1px solid ${colors.lightgray}`
          }}
        >
          <section
            className={css(styles.gridRow, styles.stepsRow, styles.wide)}
          >
            <div className={css(styles.sectionHeader)}>
              <h1>
                {'Forget Q&As\n'}
                <p className={css(styles.sectionSubheader)}>
                  Invite your readers and listeners to an in-depth conversation powered by Sideway — the simple,
                  friendly platform for bloggers, publishers, & content creators.
                </p>
              </h1>
            </div>
            <div className={css(styles.step, styles.introStep)}>
              <p className={css(styles.introStepText)}>
                <b
                  style={{
                    marginBottom: 8
                  }}
                >
                  One.
                </b>
                <br />
                Invite your readers and followers to your Sideway conversation using social media.
              </p>
              <div className={css(styles.squareImageWrapper)}>
                <img
                  className={css(styles.squareImage)}
                  src={stepOneUrl}
                  alt={
                    'Invite your readers and followers to your Sideway conversation using social media.'
                  }
                />
              </div>
            </div>
            <div className={css(styles.step, styles.introStep)}>
              <div className={css(styles.squareImageWrapper)}>
                <img
                  className={css(styles.squareImage)}
                  src={stepTwoUrl}
                  alt={
                    'Enjoy a focused, distraction-free conversation in a safe, spam-free environment.'
                  }
                />
              </div>
              <p className={css(styles.introStepText)}>
                <b
                  style={{
                    marginBottom: 8
                  }}
                >
                  Two.
                </b>
                <br />
                Enjoy a focused, distraction-free conversation in a safe, spam-free environment.
              </p>
            </div>
            <div className={css(styles.step, styles.introStep)}>
              <p className={css(styles.introStepText)}>
                <b
                  style={{
                    marginBottom: 8
                  }}
                >
                  Three.
                </b>
                <br />
                Export the finished conversation to your Medium or WordPress blog.
              </p>
              <div className={css(styles.squareImageWrapper)}>
                <img
                  className={css(styles.squareImage)}
                  src={stepThreeUrl}
                  alt={
                    'Export the finished conversation to your Medium or WordPress blog.'
                  }
                />
              </div>
            </div>
          </section>
          <CallToAction index={1} />
        </div>
        <Spacer />
        <div
          style={{
            position: 'relative',
            width: '100%',
            marginTop: 16,
            opacity: 1
          }}
        >
          <section className={css(styles.row)}>
            <div className={css(styles.sectionHeader)}>
              <h1 style={{ marginBottom: 32 }}>
                {'Creating truly worthwhile content is a tough job.\n'}
                <p
                  style={{
                    marginTop: 16,
                    fontSize: '62.5%',
                    fontWeight: 'light',
                    lineHeight: 1.2,
                    letterSpace: 'normal',
                    color: colors.darkgray
                  }}
                >
                  Your readers can help you.
                </p>
              </h1>
            </div>
            <p className={css(styles.copy)}>
              <b>
                {
                  'Till now, you’ve probably made do with social media and enterprise chat'
                }
              </b>
              {' '}to engage your readers, listeners, and followers.
            </p>
            <p className={css(styles.copy)}>
              Sure, it can work… but between the constant distractions and crowded hashtags, it’s just too hard to engage
              in a meaningful exchange.
            </p>
            <p className={css(styles.copy)}>
              And forget about returning to that conversation later, because it’s tough to track down or just plain gone
              (goodbye, valuable insights).
            </p>
            <p className={css(styles.copy)}>
              <b>
                Trying to build a deep connection with your audience using tools that aren’t made for real conversations
              </b>
              {
                ' — like social media, Q&A products, or enterprise chat — is like harvesting wheat with your bare hands instead of using a scythe.'
              }
            </p>
            <p className={css(styles.copy)}>
              Sure, you might gain some grain, but you’ll mostly end up with chaff (and sore hands).
            </p>
            <ShedBackground
              winWidth={winWidth}
              winHeight={winHeight}
              scrollTop={scrollTop}
            />
          </section>
          <CallToAction index={2} />
          <div style={{ height: Math.min(380, winHeight / 2) }} />
        </div>
        <div
          style={{
            position: 'relative',
            width: '100%',
            marginTop: 0,
            opacity: 1,
            borderTop: `1px solid ${colors.lightgray}`
          }}
        >
          <section className={css(styles.gridRow, styles.stepsRow)}>
            <div className={css(styles.sectionHeader)}>
              <h1>
                {'All the things you love\nabout talking with your audience\n'}
                <p className={css(styles.sectionSubheader)}>
                  (and none of the headaches)
                </p>
              </h1>
            </div>
            <p className={css(styles.copy)}>
              Sideway’s elegant, minimalist platform makes it easy to manage audience participation, topics, and
              conversation flow.
            </p>
            <p className={css(styles.copy)} style={{ marginBottom: 32 }}>
              Our unique technology means there are no hashtags required, and no trolls allowed. Let’s bring focus and
              civility back to public discourse.
            </p>
            <div className={css(styles.step)}>
              <div style={{ marginRight: 0 }}>
                <b>
                  You control the conversation
                </b>
                <p>
                  Answer audience questions and approve or reject comments before others can see them. Sideway’s intuitive
                  interface takes only seconds to master.
                </p>
              </div>
              {/* <div className={css(styles.squareImageWrapper)}> */}
              {/* <div className={css(styles.squareImage)} /> */}
              {/* </div> */}
            </div>
            <div className={css(styles.step)}>
              {/* <div className={css(styles.squareImageWrapper)}> */}
              {/* <div className={css(styles.squareImage)} /> */}
              {/* </div> */}
              <div style={{ marginLeft: 0 }}>
                <b>
                  No more interruptions
                </b>
                <p>
                  See when others are chiming in & read a preview of what they’re typing — all in a calm, distraction-free
                  environment with no character limits.
                </p>
              </div>
            </div>
            <div className={css(styles.step)}>
              <div style={{ marginRight: 0 }}>
                <b>
                  Learn more with detailed Live Insights
                </b>
                <p>
                  Sideway’s one-of-a-kind technology gives you insight into your audience’s real-time behavior, so you can
                  keep them engaged.
                </p>
              </div>
              {/* <div className={css(styles.squareImageWrapper)}> */}
              {/* <div className={css(styles.squareImage)} /> */}
              {/* </div> */}
            </div>
          </section>
        </div>
        <CallToAction index={3} />
        <Spacer border={false} />
        <Blockquote
          quoteText='Given the size of our follower base and their wide interest in our technology, Twitter chats felt spam-y. Sideway provided us with a better place to hold conversations about different topics. We can promote the conversations on our existing channels and people can choose when to tune in can. It really helps us cater our content for the right audience.'
          attributionText={'Zibby Keaton\nMedia Relations\nNodeJS Foundation'}
          headshotUrl={zibbyHeadshotUrl}
        />
        <Spacer />
        <section className={css(styles.row)}>
          <h1 className={css(styles.sectionHeader)}>
            {'Busy content creators, meet your ace in the hole\n'}
          </h1>
          <p className={css(styles.copy)}>
            Done chatting? Export your full Sideway chat transcript as a Medium or WordPress blog draft. Or, download
            a copy in seconds.
          </p>
          <p className={css(styles.copy)}>
            It just might be the easiest content creation you’ve done in months.
          </p>
          <div className={css(styles.convertDemoDisplay)}>
            <div className={css(styles.mediumDemoPaddingHackBlock)} />
            <video
              ref={node => {
                this.mediumExportVideo = node
              }}
              autoPlay
              src={sidewayMediumVideo}
              loop
              preload={'auto'}
              className={css(styles.inlineDemoVideo)}
            />
          </div>
        </section>
        <CallToAction index={4} />
        <Spacer />
        <section className={css(styles.gridRow, styles.stepsRow)}>
          <h1 className={css(styles.sectionHeader)}>
            If you want deeper audience engagement,
            Sideway is for you
            <p className={css(styles.sectionSubheader)}>
              Talk, teach, save and share.
            </p>
          </h1>
          <div className={css(styles.step, styles.smallStep)}>
            <div
              className={css(
                styles.squareImageWrapper,
                styles.smallImageWrapper
              )}
            >
              <div className={css(styles.squareImage)} />
            </div>
            <div style={{ ...font.body1, marginLeft: 16 }}>
              <b>
                Enterprise & corporate blogs
              </b>
              <p>
                Instead of another dry press release, promote your new products and services with a live, authentic
                conversation with an actual customer.
              </p>
            </div>
          </div>
          <div className={css(styles.step, styles.smallStep)}>
            <div
              className={css(
                styles.squareImageWrapper,
                styles.smallImageWrapper
              )}
            >
              <div className={css(styles.squareImage)} />
            </div>
            <div style={{ ...font.body1, marginLeft: 16 }}>
              <b>
                Publishers & podcasters
              </b>
              <p>
                Your readers have more to tell you than they can fit in the comment section. Invite them to a Sideway
                conversation on the topic of your choice, and boom: you’ve got relevant new ideas for your editorial
                calendar.
              </p>
            </div>
          </div>
          <div className={css(styles.step, styles.smallStep)}>
            <div
              className={css(
                styles.squareImageWrapper,
                styles.smallImageWrapper
              )}
            >
              <div className={css(styles.squareImage)} />
            </div>
            <div style={{ ...font.body1, marginLeft: 16 }}>
              <b>
                Live interviews
              </b>
              <p>
                Invite leaders in your community or industry to chat live on Sideway, then publish the interview
                straight to your blog.
              </p>
            </div>
          </div>
          <div className={css(styles.step, styles.smallStep)}>
            <div
              className={css(
                styles.squareImageWrapper,
                styles.smallImageWrapper
              )}
            >
              <div className={css(styles.squareImage)} />
            </div>
            <div style={{ ...font.body1, marginLeft: 16 }}>
              <b>
                Enterprise town halls
              </b>
              <p>
                Thoroughly answer your team’s questions, and turn your finished conversation into an easy reference for
                new hires. No one likes listening to an hour-long recorded conference call.
              </p>
            </div>
          </div>
          <div className={css(styles.step, styles.smallStep)}>
            <div
              className={css(
                styles.squareImageWrapper,
                styles.smallImageWrapper
              )}
            >
              <div className={css(styles.squareImage)} />
            </div>
            <div style={{ ...font.body1, marginLeft: 16 }}>
              <b>
                Conference talk follow-up or Q&A
              </b>
              <p>
                Highlight your event’s most popular speakers and give them a chance to answer more questions after your
                event ends.
              </p>
            </div>
          </div>
        </section>
        <CallToAction index={5} />
        <Spacer border={false} />
        <Blockquote
          quoteText='I love the fact that viewers can ask questions. I try to encourage them to join the conversation. The ability to accept, reject, and direct the conversation as it went along—that was fascinating.'
          attributionText={'Taron Foxworth\nDeveloper Evangelist\nLosant'}
          headshotUrl={foxworthHeadshotUrl}
        />
        <Spacer />
        <section className={css(styles.row)}>
          <div className={css(styles.sectionHeader)}>
            Frequently Asked Questions
          </div>
          <div className={css(styles.faqBlock)}>
            <div className={css(styles.faqQuestion)}>
              Is Sideway just another social media channel?
            </div>
            <div className={css(styles.faqAnswer)}>
              No. Think of Sideway as your go-to tool for content generation and hosting. Use your website and social
              media to invite your audience to your live Sideway conversation, then publish the finished conversation on
              your site! Sideway works WITH your website and your favorite social channels, so you never have to worry
              about splitting your traffic.
            </div>
          </div>
          <div className={css(styles.faqBlock)}>
            <div className={css(styles.faqQuestion)}>
              If I invite people to Sideway, do they have to install anything?
            </div>
            <div className={css(styles.faqAnswer)}>
              Nope. Sideway exists 100% online, meaning new users can pop right into your browser-based chat room with
              no prep and no problem. No native app required.
            </div>
          </div>
          <div className={css(styles.faqBlock)}>
            <div className={css(styles.faqQuestion)}>
              How do I invite participants to join my conversation?
            </div>
            <div className={css(styles.faqAnswer)}>
              Just send them the shortlink to your Sideway chat room. Sideway works seamlessly on desktop and mobile, so
              participants can chime in no matter where they are.
            </div>
          </div>
          <div className={css(styles.faqBlock)}>
            <div className={css(styles.faqQuestion)}>
              How many hosts can I have in my Sideway conversation?
            </div>
            <div className={css(styles.faqAnswer)}>
              Up to 5 hosts can manage audience questions and comments, so you never get overwhelmed.
            </div>
          </div>
          <div className={css(styles.faqBlock)}>
            <div className={css(styles.faqQuestion)}>
              Where do my conversations live after they’re done?
            </div>
            <div className={css(styles.faqAnswer)}>
              You can export your finished Sideway conversation to Medium or WordPress as a blog draft, or download a
              copy. You can also save it to your personal Sideway Page for easy online reference later.
            </div>
          </div>
          <div className={css(styles.faqBlock)}>
            <div className={css(styles.faqQuestion)}>
              What audience data does Sideway give me?
            </div>
            <div className={css(styles.faqAnswer)}>
              Sideway’s Live Insights tell you where your audience is coming from and how their behavior changes
              depending on your conversation. Use this data to better target your advertising creative and budget.
            </div>
          </div>
          <div className={css(styles.faqBlock)}>
            <div className={css(styles.faqQuestion)}>
              Will it be hard to get my team to use Sideway?
            </div>
            <div className={css(styles.faqAnswer)}>
              Not at all. Sideway’s intuitive, distraction-free interface is easy to master in just a minute or two.
            </div>
          </div>
        </section>
        <CallToAction index={6} />
        <div
          style={{
            height: 'calc(50vh - 96px)',
            maxHeight: 680
          }}
        />
      </StandardPage>
    )
  };
}

const styles = StyleSheet.create({
  header: {
    flex: 'none',
    position: 'fixed',
    top: -1,
    left: 0,
    height: 'calc((72px + 1vh + 1vw) / 3)',
    minHeight: 72,
    width: '100%',
    paddingTop: 16,
    paddingRight: 8,
    paddingBottom: 16,
    paddingLeft: 8,
    zIndex: 11,
    backgroundColor: colors.white,
    [mediaQueries.tablet]: {
      boxSizing: 'content-box',
      height: 'calc((118px + 1vh + 1vw) / 3)',
      paddingRight: 0,
      paddingLeft: 0
    }
  },
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    width: 'calc(100% - 16px)',
    maxWidth: 1028,
    margin: '0 auto'
  },
  headerLogo: {
    height: '100%'
  },
  row: {
    width: '100%',
    maxWidth: breakpoints.tablet,
    margin: '0 auto',
    paddingTop: 16,
    paddingRight: 8,
    paddingBottom: 16,
    paddingLeft: 8
    // backgroundColor: 'rgba(255, 255, 255, 0.9)'
  },
  gridRow: {
    display: 'flex',
    justifyContent: 'space-around',
    paddingTop: 32,
    paddingRight: 8,
    paddingBottom: 32,
    paddingLeft: 8,
    borderRadius: 8
    // backgroundColor: 'rgba(255, 255, 255, 0.9)'
  },
  gridItem: {
    flex: '1 1 auto'
    // backgroundColor: 'rgba(255, 255, 255, 0.8)'
  },
  sectionHeader: {
    fontSize: 'calc((96px + 1vh + 1vw) / 3)',
    lineHeight: 1.2,
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 32,
    letterSpace: '-.125em',
    color: colors.darkgray,
    textAlign: 'center',
    whiteSpace: 'pre-wrap'
  },
  sectionSubheader: {
    marginTop: 16,
    marginBottom: 16,
    fontSize: 'calc((48px + 1vh + 1vw) / 3)',
    fontWeight: 'light',
    lineHeight: 1.2,
    letterSpace: 'normal',
    color: colors.midgray
  },
  copy: {
    ...font.body1,
    width: '100%',
    maxWidth: breakpoints.tablet,
    margin: '0 auto',
    paddingTop: 8,
    paddingRight: 0,
    paddingBottom: 8,
    paddingLeft: 0
  },
  spacer: {
    borderTop: `1px solid ${colors.faintgray}`,
    margin: '16px auto',
    [mediaQueries.tablet]: {
      margin: '32px auto',
      maxWidth: 'calc(100% - 128px)',
      borderTop: `1px solid ${colors.lightgray}`
    }
  },
  heroTextContainer: {
    maxWidth: breakpoints.tablet,
    margin: '0 auto',
    fontSize: 'calc((72px + 1vh + 1vw) / 3)',
    lineHeight: 1.2,
    marginTop: 0,
    marginBottom: 32,
    paddingTop: 0,
    paddingBottom: 0,
    letterSpace: '-.125em',
    color: colors.darkgray,
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
    overflow: 'hidden',
    [mediaQueries.tablet]: {
      marginTop: 32,
      fontSize: 'calc((118px + 1vh + 1vw) / 3)'
    }
  },
  heroCopyAwesome: {
    display: 'inline',
    fontWeight: 'bolder',
    letterSpace: 'normal',
    color: colors.darkgray
  },
  learnMore: {
    fontSize: 'calc((42px + 1vh + 1vw) / 3)',
    fontWeight: 'normal',
    outline: 'none',
    border: 'none',
    boxShadow: 'none'
  },
  videoPaddingHackBlock: {
    display: 'block',
    content: '""',
    width: '100%',
    paddingTop: (360 / (640 + 16)) * 100 + '%'
  },
  videoClosebutton: {},
  stepsRow: {
    flexDirection: 'column',
    width: 'calc(100% - 16px)',
    maxWidth: breakpoints.tablet,
    margin: '0 auto'
  },
  wide: {
    maxWidth: breakpoints.tablet
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.darkgray,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    width: '80%',
    maxWidth: '100%',
    margin: '16px auto 16px',
    fontSize: 'calc((48px + 1vh + 1vw) / 3)',
    // lineHeight: 1.2,
    textAlign: 'center',
    [mediaQueries.tablet]: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      margin: '0 auto 32px',
      textAlign: 'left'
    },
    ':last-child': {
      marginBottom: 0
    }
  },
  smallStep: {},
  introStep: {
    fontSize: 'calc((48px + 1vh + 1vw) / 3)',
    lineHeight: 1.2,
    margin: '16px auto 16px',
    [mediaQueries.tablet]: {
      margin: '0 auto 8px'
    }
  },
  introStepText: {
    width: '100%',
    flex: 'none',
    [mediaQueries.tablet]: {
      flex: '0 0 57.5%'
    }
  },
  squareImageWrapper: {
    position: 'relative',
    flex: 'none',
    width: '42.5%',
    ':before': {
      display: 'block',
      content: '""',
      width: '100%',
      paddingTop: '100%'
    },
    marginBottom: 16,
    order: -1,
    [mediaQueries.tablet]: {
      flex: '1 0 37.5%',
      width: '37.5%',
      maxWidth: '37.5%',
      marginBottom: 0,
      order: 'initial'
    }
  },
  smallImageWrapper: {
    flex: '1 0 15%',
    width: '15%',
    display: 'none',
    [mediaQueries.tablet]: {
      dipsplay: 'block'
    }
  },
  squareImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '3%'
  },
  callToActionWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 0,
    [mediaQueries.tablet]: {
      marginTop: 0
    }
  },
  blockQuoteWrapper: {
    // [mediaQueries.tablet]: {
    //   fontSize: 'calc((118px + 1vh + 1vw) / 3)'
    // },
    width: 'calc(100% - 16px)',
    maxWidth: breakpoints.tablet,
    margin: '32px auto',
    fontSize: 'calc((42px + 1vh + 1vw) / 3)'
  },
  quoteAttribution: {
    ...font.body2,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 8,
    paddingRight: 16,
    paddingBottom: 8,
    paddingLeft: 8,
    textAlign: 'right',
    whiteSpace: 'pre-wrap'
  },
  quoteHeadshot: {
    height: 48,
    width: 48,
    marginLeft: 8,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundOrigin: 'padding-box',
    borderRadius: '50%'
  },
  list: {
    maxWidth: breakpoints.tablet,
    margin: '32px auto',
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    listStyleType: 'none'
  },
  listItem: {
    ...font.title,
    position: 'relative'
  },
  preWrap: {
    whiteSpace: 'pre-wrap'
  },
  convertDemoDisplay: {
    ...commonStyles.drawnBorder(true, true, true, true, colors.darkgray),
    display: 'flex',
    justifyContent: 'space-around',
    position: 'relative',
    maxWidth: 480,
    margin: '32px auto 0'
  },
  mediumDemoPaddingHackBlock: {
    display: 'block',
    content: '""',
    width: '100%',
    paddingTop: 1080 / 1144 * 100 + '%'
  },
  inlineDemoVideo: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '3%'
  },
  faqBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingRight: 0,
    paddingBottom: 16,
    paddingLeft: 0
  },
  faqQuestion: {
    ...font.title,
    fontWeight: 'bold'
  },
  faqAnswer: {
    ...font.body1,
    paddingTop: 8,
    paddingRight: 0,
    paddingBottom: 16,
    paddingLeft: 0
  },
  noCommitmentReq: {
    ...font.caption,
    padding: 8,
    margin: '0 auto',
    textAlign: 'center'
  }
})
