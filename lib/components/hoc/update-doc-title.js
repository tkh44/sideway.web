import { Component } from 'react'
import shallowCompare from 'shallow-compare'

const updateDocTitle = (mapPropsToTitle = props => props.title) => {
  return WrappedComponent => {
    class DocTitle extends Component {
      constructor (props) {
        super(props)

        this.oldDocumentTitle = document.title
      }

      componentDidMount () {
        this.setDocTitle()
      }

      shouldComponentUpdate (nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
      }

      componentDidUpdate (prevProps) {
        const prevTitle = mapPropsToTitle(prevProps)
        const nextTitle = mapPropsToTitle(this.props)

        if (prevTitle !== nextTitle) {
          this.setDocTitle()
        }
      }

      componentWillUnmount () {
        document.title = this.oldDocumentTitle
      }

      render () {
        return <WrappedComponent {...this.props} />
      }

      setDocTitle () {
        const docTitle = mapPropsToTitle(this.props)

        if (docTitle) {
          document.title = docTitle
        }
      }
    }

    return DocTitle
  }
}

export default updateDocTitle
