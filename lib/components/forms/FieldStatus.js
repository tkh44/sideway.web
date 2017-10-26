import { Component } from 'react'
import { isEmpty } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'

export default class FieldStatus extends Component {
  static defaultProps = {
    error: false,
    success: false
  };

  state = {
    lastValue: ''
  };

  componentWillReceiveProps (nextProps) {
    if (this.props.loading && !nextProps.loading) {
      this.setState({ lastValue: this.props.value })
    }
  }

  render () {
    const {
      hasLabel,
      value,
      touched,
      success,
      error,
      initialValue
    } = this.props

    if (
      !touched ||
      isEmpty(value) ||
      value === initialValue ||
      !(error || success)
    ) {
      return <div style={{ display: 'none' }} />
    }

    if (error) {
      return (
        <div
          className={css(
            styles.fieldStatus,
            styles.error,
            hasLabel && styles.hasLabel
          )}
        >
          {error}
        </div>
      )
    }

    return (
      <div
        className={css(
          styles.fieldStatus,
          styles.success,
          hasLabel && styles.hasLabel
        )}
      >
        {success}
      </div>
    )
  }
}

const styles = StyleSheet.create({
  fieldStatus: {
    ...font.caption,
    position: 'absolute',
    top: 0,
    right: 8,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  hasLabel: {
    top: font.caption.fontSize
  },
  success: {
    color: colors.midgreen
  },
  error: {
    color: colors.red
  }
})
