import { Component } from 'react'
import withRouter from 'react-router-dom/es/withRouter'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font, forms } from 'style'
import Icon from 'art/Icon'
import Popover from 'ui/Popover'
import BasicTooltip from 'ui/BasicTooltip'
import { pageActions } from 'redux/pages'

export default withRouter(
  class CreatePageForm extends Component {
    static defaultProps = {
      transitionOnSuccess: true,
      onSubmit: () => {},
      onSuccess: () => {},
      onError: () => {}
    };

    state = {
      pageTitle: '',
      submitting: false,
      error: false
    };

    render () {
      const { pageTitle, submitting } = this.state

      return (
        <div className={css(styles.createFormWrapper)}>
          <form
            className={css(styles.createPageForm)}
            onSubmit={this.handleSubmit}
          >
            <input
              className={css(styles.input)}
              onChange={this.handleTitleChange}
              name='Page Name'
              type='pageName'
              value={pageTitle}
              placeholder='Create a new page'
              aria-label='Create a new page'
            />
            <Popover
              component='button'
              disabled={submitting}
              type='submit'
              className={css(styles.createButton)}
              popoverComponent={BasicTooltip}
              popoverProps={{
                tooltip: 'Create Page',
                style: {
                  width: 'auto'
                }
              }}
            >
              <Icon
                className={css(styles.addIcon)}
                name='add'
                fill='rgba(255, 255, 255, 1)'
                style={{
                  width: 38,
                  height: 38
                }}
              />
            </Popover>
          </form>
          {this.state.error &&
            <div className={css(styles.error)}>
              {this.state.error}
            </div>}
        </div>
      )
    }

    handleTitleChange = ({ target }) =>
      this.setState({ pageTitle: target.value, error: false });

    handleSubmit = async e => {
      e.preventDefault()

      const { pageTitle } = this.state
      const {
        dispatch,
        onError,
        onSubmit,
        onSuccess,
        history: { push },
        transitionOnSuccess
      } = this.props

      if (!pageTitle) {
        return
      }

      this.setState({ submitting: true, error: false })
      onSubmit(pageTitle)
      const res = await dispatch(pageActions.create({ title: pageTitle }))
      this.setState({
        submitting: false,
        error: res.ok ? false : "We couldn't create your page at this time"
      })

      if (res.ok) {
        onSuccess(res)
        if (transitionOnSuccess) {
          push(`/page/${res.data.id}`)
        }
      } else {
        onError(res)
      }
    };
  }
)

const styles = StyleSheet.create({
  createFormWrapper: {
    marginTop: 16,
    marginBottom: 16
  },
  createPageForm: {
    display: 'flex',
    justifyContent: 'center'
  },
  input: {
    ...forms.largeInput,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  createButton: {
    position: 'relative',
    display: 'flex',
    flex: 'none',
    width: 44,
    height: 44,
    background: colors.brandgreen,
    border: `1px solid ${colors.transparent}`,
    borderLeft: 'none',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    ':hover': {
      backgroundColor: colors.brandgreen
    }
  },
  addIcon: {
    position: 'absolute',
    top: 2,
    left: 3
  },
  error: {
    ...font.caption,
    padding: 4,
    color: colors.red
  }
})
