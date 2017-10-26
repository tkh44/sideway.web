import { PureComponent } from 'react'
import { TransitionMotion } from 'react-motion'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'

export default class InsightTabularData extends PureComponent {
  static defaultProps = {
    data: [],
    getKey: (datum, i) => datum.key, // must return valid string
    getDefaultStyles: datum => {}, // must return { percentage: number | spring, opacity: number | spring }
    getStyles: datum => {}, // must return { percentage: number | spring, opacity: number | spring }
    getWillEnter: datum => {}, // must return { percentage: number | spring, opacity: number | spring }
    getWillLeave: datum => {} // must return { percentage: number | spring, opacity: number | spring }
  };

  render () {
    const {
      renderPrimary,
      renderSecondary
    } = this.props

    return (
      <TransitionMotion
        defaultStyles={this.getDefaultStyles()}
        styles={this.getStyles}
        willEnter={this.willEnter}
        willLeave={this.willLeave}
      >
        {currentStyles => {
          return (
            <div>
              {currentStyles.map(({ key, data, style }) => {
                return (
                  <div
                    key={key}
                    className={css(styles.row)}
                    style={{ opacity: style.opacity }}
                  >
                    {renderPrimary(data, style)}
                    {renderSecondary(data, style)}
                    <div
                      className={css(styles.bottomPercentBar)}
                      style={{ width: `${style.percent}%` }}
                    />
                  </div>
                )
              })}
            </div>
          )
        }}
      </TransitionMotion>
    )
  }

  getDefaultStyles = () => {
    const {
      getKey,
      getDefaultStyles,
      data
    } = this.props

    return data.map((data, i) => {
      return {
        key: getKey(data, i),
        data,
        style: getDefaultStyles(data)
      }
    })
  };

  getStyles = (prevStyles = []) => {
    const {
      getKey,
      getStyles,
      data
    } = this.props

    return data.map((data, i) => {
      return {
        key: getKey(data, i),
        data,
        style: getStyles(data)
      }
    })
  };

  willEnter = ({ data }) => {
    const { getWillEnter } = this.props
    return getWillEnter(data)
  };

  willLeave = ({ data }) => {
    const { getWillLeave } = this.props
    return getWillLeave(data)
  };
}

const styles = StyleSheet.create({
  referrerHeading: {
    ...font.body1,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    color: colors.lightgray
  },
  row: {
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingTop: 8,
    paddingRight: 0,
    paddingBottom: 8,
    paddingLeft: 0,
    borderBottom: `1px solid ${colors.faintgray}`
  },
  column: {
    ...font.caption
  },
  bottomPercentBar: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    height: 2,
    backgroundColor: colors.brandgreen
  },
  primary: {
    ...font.caption,
    flex: '2 1 50%',
    flexWrap: 'wrap',
    minWidth: '50%',
    color: colors.brandgreen,
    textDecoration: 'underline'
  },
  direct: {
    color: colors.lightgray,
    textDecoration: 'none'
  },
  secondary: {
    ...font.caption,
    flex: '1 1 25%'
  }
})
