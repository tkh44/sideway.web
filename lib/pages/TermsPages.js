import Redirect from 'react-router-dom/es/Redirect'
import compose from 'recompose/compose'
import withHandlers from 'recompose/withHandlers'
import withRouter from 'react-router-dom/es/withRouter'
import scrollTopOnMount from 'hoc/scrollTopOnMount'
import StandardPage from 'ui/StandardPage'
import Header from 'ui/Header'
import Footer from 'ui/Footer'
import BugBountyHTML from 'policies/bug-bounty-program.md'
import DMCAPolicyHTML from 'policies/dmca-policy.md'
import PrivacyHTML from 'policies/privacy-policy.md'
import TermsHTML from 'policies/terms-of-service.md'
import TrademarkHTML from 'policies/trademark-policy.md'
import UsageRulesHTML from 'policies/usage-rules.md'
import UsernamePolicyHTML from 'policies/username-policy.md'

const githubLinkRegex = /https:\/\/github.com\/sideway\/policies\/blob\/master(.*).md/ig
const PAGES = {
  terms: TermsHTML.replace(githubLinkRegex, '/terms$1'),
  'privacy-policy': PrivacyHTML.replace(githubLinkRegex, '/terms$1'),
  'bug-bounty-program': BugBountyHTML.replace(githubLinkRegex, '/terms$1'),
  'dmca-policy': DMCAPolicyHTML.replace(githubLinkRegex, '/terms$1'),
  'trademark-policy': TrademarkHTML.replace(githubLinkRegex, '/terms$1'),
  'usage-rules': UsageRulesHTML.replace(githubLinkRegex, '/terms$1'),
  'username-policy': UsernamePolicyHTML.replace(githubLinkRegex, '/terms$1')
}

export default compose(
  withRouter,
  withHandlers({
    handleAppLinkClicks: ({ history: { replace } }) =>
      e => {
        if (e.target.tagName === 'A') {
          const href = e.target.getAttribute('href')
          if (href.indexOf('/') === 0) {
            replace(href)
            e.preventDefault()
          }
        }
      }
  }),
  scrollTopOnMount
)(({ match, location, handleAppLinkClicks }) => {
  if (location.pathname.indexOf('/terms/terms-of-service') === 0) {
    return <Redirect to='/terms' />
  }

  let pageName
  if (match.isExact) {
    pageName = 'terms'
  } else {
    pageName = location.pathname.split('/terms/')[1].split('/')[0]
  }

  return (
    <StandardPage header={Header} footer={Footer}>
      <article
        className='markdown-page'
        onClick={handleAppLinkClicks}
        dangerouslySetInnerHTML={{
          __html: PAGES[pageName]
        }}
      />
    </StandardPage>
  )
})
