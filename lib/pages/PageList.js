import { Component } from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash'
import compose from 'recompose/compose'
import branch from 'recompose/branch'
import renderComponent from 'recompose/renderComponent'
import Redirect from 'react-router-dom/es/Redirect'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, commonStyles, font } from 'style'
import updateDocTitle from 'hoc/update-doc-title'
import scrollTopOnMount from 'hoc/scrollTopOnMount'
import StandardPage from 'ui/StandardPage'
import Header from 'ui/Header'
import Footer from 'ui/Footer'
import CreatePage from 'pages/CreatePage'
import PageListItem from 'pages/PageListItem'
import { pageActions } from 'redux/pages'
import { pickPagesFromList } from 'selectors/pages'

const EmptyList = ({ emptyMessage }) => (
  <div className={css(styles.emptyList)}>
    {emptyMessage}
  </div>
)

const ListContainer = branch(
  ({ pages }) => !!pages.length,
  c => c,
  renderComponent(EmptyList)
)(({ pages }) => (
  <section>
    {pages.map(page => <PageListItem key={page.id} page={page} />)}
  </section>
))

const mapStateToProps = (state, props) => {
  return {
    pages: state.pages,
    profile: state.profile || {}
  }
}

export default compose(
  connect(mapStateToProps),
  updateDocTitle(() => 'Pages'),
  scrollTopOnMount
)(
  class PageList extends Component {
    componentDidMount () {
      this.fetchPages()
    }

    render () {
      const { dispatch, pages, profile } = this.props
      const reqMeta = get(profile, 'pages.$$meta', {})
      const { fetching, status } = reqMeta

      const redirect = fetching === false && status !== 200 && status !== 403

      if (redirect) {
        return <Redirect to={status === 404 ? '/404' : '/500'} />
      }

      const usersPages = pickPagesFromList(get(profile, 'pages.ids'), pages)
      let emptyMessage = ''
      if (status === 403) {
        emptyMessage = (
          <span>
            <span
              className={css(styles.signInLink)}
              onClick={() => {
                dispatch({
                  type: 'modal/SHOW',
                  payload: {
                    modal: 'login',
                    data: { nextState: window.location.pathname }
                  }
                })
              }}
            >
              Sign in
            </span>
            {' to see your pages.'}
          </span>
        )
      } else if (fetching) {
        emptyMessage = ''
      } else {
        emptyMessage = "You don't have any pages"
      }

      return (
        <StandardPage header={Header} footer={Footer}>
          {profile.id && <CreatePage dispatch={dispatch} />}
          <ListContainer emptyMessage={emptyMessage} pages={usersPages} />
        </StandardPage>
      )
    }

    fetchPages () {
      const { dispatch } = this.props
      dispatch(pageActions.list())
    }
  }
)

const styles = StyleSheet.create({
  emptyList: {
    ...font.headline,
    padding: 32,
    color: colors.lightgray,
    textAlign: 'center'
  },
  signInLink: {
    ...commonStyles.fancyLink,
    cursor: 'pointer'
  }
})
