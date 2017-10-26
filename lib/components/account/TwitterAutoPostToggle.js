import { Component } from 'react'
import compose from 'recompose/compose'
import defaultProps from 'recompose/defaultProps'
import withProps from 'recompose/withProps'
import Toggle from 'ui/Toggle'
import Confirm from 'ui/Confirm'
import { notifyError, notifySuccess } from 'redux/sitrep'
import { profileActions } from 'redux/profile'

export default compose(
  defaultProps({ preferences: { twitter: {} } }),
  withProps(({ preferences }) => ({
    autoPost: preferences.twitter && preferences.twitter.autoPost
  }))
)(
  class TwitterAutoPostToggle extends Component {
    state = {
      confirming: false
    };

    render () {
      const { confirming } = this.state
      const { autoPost } = this.props

      if (confirming) {
        return (
          <Confirm
            confirmButtonColor='brandgreen'
            message='Are you sure you want to turn this on?'
            onCancel={this.handleCancel}
            onConfirm={this.handleSave}
            cancelText='No'
            confirmText='Turn On'
          />
        )
      }

      return (
        <Toggle
          value={autoPost}
          label='Automatically create a conversation and post it using your Twitter account when you end a tweet with @gosideway.'
          onChange={this.handleChange}
        />
      )
    }

    handleChange = () => {
      const { autoPost } = this.props
      if (!autoPost) {
        this.setState({ confirming: true })
        return
      }

      this.handleSave()
    };

    handleCancel = () => {
      this.setState({ confirming: false })
    };

    handleSave = async () => {
      const { autoPost, dispatch } = this.props
      const updatedValue = !autoPost
      const payload = { preferences: { twitter: { autoPost: updatedValue } } }

      const { ok } = await dispatch(profileActions.patchProfile(payload))

      if (ok) {
        dispatch(
          notifySuccess(`Auto post ${updatedValue ? 'enabled' : 'disabled'}.`)
        )
      } else {
        dispatch(notifyError("Can't update Twitter settings right now."))
      }

      this.setState({ confirming: false })
    };
  }
)
