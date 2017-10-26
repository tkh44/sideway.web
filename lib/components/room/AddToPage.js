import { Component } from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import Textarea from 'react-textarea-autosize'
import { compose } from 'recompose'
import { colors, commonStyles, font, forms, utils } from '../../style'
import withRouter from 'react-router-dom/es/withRouter'
import SidewayModal from '../modals/SidewayModal'
import CardTooltip from '../ui/CardTooltip'
import Button from '../ui/Button'
import CreatePageForm from '../pages/CreatePage'
import SectionAutocomplete from '../pages/SectionAutocomplete'
import { pageActions } from 'redux/pages'
import { pickPagesFromList } from '../../selectors/pages'

const PageListing = ({ pages, onPageClick }) => {
  return (
    <div className={css(styles.pageListing)}>
      {pages.map(page => {
        return (
          <button
            key={page.id}
            className={css(styles.pageListingPage)}
            onClick={() => {
              onPageClick(page.id)
            }}
          >
            {page.title}
          </button>
        )
      })}
      {!pages.length &&
        <div className={css(styles.emptyList)}>
          You have no pages.
        </div>}
    </div>
  )
}

const AddToPageForm = compose(withRouter)(
  class extends Component {
    state = {
      comment: '',
      page: null,
      section: '',
      submitting: false,
      error: null,
      creatingNewPage: false,
      createError: "We couldn't create your page at this time"
    };

    componentDidUpdate () {
      if (this.textArea) {
        this.textArea._resizeComponent()
      }
    }

    render () {
      const { dispatch, pages } = this.props
      const currentPage = pages.find(p => p.id === this.state.page)
      const currentPageName = get(currentPage, 'title', 'Page')

      return (
        <div data-ignore-popover-close>
          <legend className={css(styles.inputWrapper)}>
            {
              `Add to ${currentPageName === 'Page' ? 'Page' : '"' + currentPageName + '"'}`
            }
          </legend>
          {!this.state.page &&
            <CreatePageForm
              dispatch={dispatch}
              transitionOnSuccess={false}
              onSubmit={this.handleCreateSubmit}
              onSuccess={this.handleCreateSuccess}
              onError={this.handleCreateError}
            />}
          {!this.state.page &&
            <PageListing
              pages={pages}
              onPageClick={id =>
                !this.state.creatingNewPage && this.setState({ page: id })}
            />}
          {this.state.page &&
            <form
              onSubmit={e => {
                e.preventDefault()
              }}
            >
              <Textarea
                ref={node => {
                  this.textArea = node
                }}
                className={css(styles.commentInput)}
                value={this.state.comment}
                onChange={this.handleFieldChange}
                name='comment'
                placeholder='Optional Notes'
                aria-label='Optional Notes'
                minRows={2}
                maxRows={4}
              />
              <SectionAutocomplete
                onChange={this.handleSectionChange}
                page={currentPage}
                value={this.state.section}
                required
              />
              {this.state.error &&
                <div className={css(styles.error)}>
                  {this.state.error}
                </div>}
              <div className={css(styles.actionRow)}>
                <Button
                  label='Select a Different Page'
                  type='button'
                  style={{
                    flex: 1,
                    maxWidth: '48%'
                  }}
                  onClick={() => this.setState({ page: null })}
                >
                  Change Page
                </Button>
                <Button
                  style={{
                    flex: 1,
                    maxWidth: '48%'
                  }}
                  color='brandgreen'
                  type='submit'
                  label='Add to Page'
                  disabled={this.state.submitting}
                  onClick={this.handleSubmit}
                >
                  <span className={css(styles.buttonContent)}>
                    Add
                  </span>
                </Button>
              </div>
            </form>}
        </div>
      )
    }

    handlePageChange = ({ value }) =>
      this.setState(prevState => {
        if (prevState.page !== value) {
          return { page: value, section: '', error: null }
        }
        return prevState
      });

    handleFieldChange = ({ target }) =>
      this.setState({ [target.name]: target.value, error: null });

    handleSectionChange = (e, { newValue }) =>
      this.setState({ section: newValue, error: null });

    handleCreateSubmit = pageTitle => {
      this.setState({ creatingNewPage: true, createError: false })
    };

    handleCreateSuccess = res => {
      const page = get(res, 'data')
      this.setState({
        page: page.id,
        creatingNewPage: false
      })
    };

    handleCreateError = res => {
      this.setState({
        creatingNewPage: false,
        createError: "We couldn't create your page at this time"
      })
    };

    handleSubmit = async e => {
      const { comment, section, page } = this.state
      const { dispatch, roomId, history: { push } } = this.props

      e.preventDefault()

      if (!(section && section.trim().length)) {
        this.setState({ error: 'A section name is required' })
        return
      }

      this.setState({ submitting: true })

      const payload = { section }
      if (comment && comment.length) payload.comment = comment

      const res = await dispatch(pageActions.putRoom(page, roomId, payload))

      if (!res.ok) {
        const message = get(res, 'data.message', '')
        const currentPage = this.props.pages.find(
          p => p.id === this.state.page
        )
        const currentPageName = get(currentPage, 'title', 'Page')
        let error

        if (message === 'Room already present') {
          error = `Room is already included on "${currentPageName}"`
        } else {
          error = `We could not add room to "${currentPageName}"`
        }

        this.setState({ submitting: false, error })
        return
      }

      push(`/page/${page}`)
    };
  }
)

const pagesProvider = C =>
  connect(({ profile, pages }) => ({ profile, pages }))(C)

export default pagesProvider(
  class AddToPage extends Component {
    state = {
      modalOpen: false
    };

    componentDidMount () {
      this.fetchPages()
    }

    render () {
      return (
        <CardTooltip.LineButton
          onClick={this.handleContainerClick}
          icon='add'
          label='Add to Page'
        >
          {this.renderModal()}
        </CardTooltip.LineButton>
      )
    }

    renderModal () {
      const { modalOpen } = this.state
      const { dispatch, pages, profile, roomId } = this.props
      const pagesFetchStatus = get(profile, 'pages.$$meta', { fetching: true })
      const usersPages = pickPagesFromList(get(profile, 'pages.ids'), pages)

      return (
        <SidewayModal
          isOpen={modalOpen}
          size='large'
          contentLabel='Add to Page'
          onRequestClose={this.handleCloseClick}
          shouldCloseOnOverlayClick={false}
          closeTimeoutMS={0}
        >
          <AddToPageForm
            dispatch={dispatch}
            pages={usersPages}
            pagesFetchStatus={pagesFetchStatus}
            roomId={roomId}
          />
        </SidewayModal>
      )
    }

    handleContainerClick = () =>
      this.setState(prev => ({ modalOpen: !prev.modalOpen }));

    handleCloseClick = () => this.setState({ modalOpen: false });

    fetchPages () {
      this.props.dispatch(pageActions.list())
    }
  }
)

const styles = StyleSheet.create({
  inputWrapper: {
    ...forms.inputWrapper
  },
  commentInput: {
    ...forms.textarea,
    minHeight: 60
  },
  buttonContent: {
    ...commonStyles.overflowEllipsis
  },
  error: {
    ...font.caption,
    paddingBottom: 4,
    color: colors.red,
    textAlign: 'center'
  },
  pageListing: {
    ...font.body1
  },
  pageListingPage: {
    ...font.body1,
    display: 'block',
    width: '100%',
    background: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    boxShadow: 'none',
    border: 'none',
    textAlign: 'left',
    paddingTop: 8,
    paddingRight: 4,
    paddingBottom: 8,
    paddingLeft: 4,
    borderRadius: 2,
    cursor: 'pointer',
    ':hover': {
      color: colors.brandgreen,
      backgroundColor: utils.color(colors.white).darken(0.025).rgb().string()
    }
  },
  emptyList: {
    ...font.body1,
    padding: 8,
    color: colors.lightgray,
    textAlign: 'center'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-around',
    paddingTop: 8
  }
})
