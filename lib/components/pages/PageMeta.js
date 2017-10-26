import { Component } from 'react'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import compose from 'recompose/compose'
import defaultProps from 'recompose/defaultProps'
import withHandlers from 'recompose/withHandlers'
import EditableText from 'ui/EditableText'
import { pageActions } from 'redux/pages'

export default compose(
  defaultProps({
    title: '',
    description: ''
  }),
  withHandlers({
    patchPage: ({ dispatch, pageId }) => {
      return payload => dispatch(pageActions.patchPage(pageId, payload))
    }
  })
)(
  class PageMeta extends Component {
    constructor (props) {
      super(props)
      this.state = {
        description: props.description,
        descriptionError: null,
        savingDescription: false,
        title: props.title,
        titleError: null,
        savingTitle: false
      }
    }

    render () {
      const {
        isOwner,
        links
      } = this.props

      if (isOwner) {
        return this.renderEditableMeta()
      }

      return (
        <div className={css(styles.pageMeta)}>
          <EditableText
            className={css(styles.title, styles.editable)}
            editClassName={css(styles.isEditing)}
            blurOnEnterPress
            placeholder='Conversation title'
            value={this.state.title}
            isFetching={this.state.savingTitle}
            hasError={this.state.titleError}
            onChange={this.handleTitleChange}
            onBlur={this.handleTitleBlur}
            renderFormattedText={false}
          />
          <EditableText
            className={css(styles.description, styles.editable)}
            editClassName={css(styles.isEditing)}
            placeholderClassName={css(styles.placeholderClassName)}
            textClassName={css(styles.textClassName)}
            placeholder='Add a description or introduction'
            value={this.state.description}
            isFetching={this.state.savingDescription}
            hasError={this.state.descriptionError}
            onChange={this.handleDescriptionChange}
            onBlur={this.handleDescriptionBlur}
            maxRows={Infinity}
            renderFormattedText
            formattedTextLinks={links}
          />
        </div>
      )
    }

    handleTitleChange = e =>
      this.setState({ title: e.target.value, titleError: false });

    handleTitleBlur = async () => {
      if (this.props.title !== this.state.title) {
        this.setState({ savingTitle: true })
        const res = await this.props.patchPage({ title: this.state.title })
        this.setState({
          savingTitle: false,
          titleError: res.ok ? null : res.data
        })
      }
    };

    handleDescriptionChange = e =>
      this.setState({ description: e.target.value, descriptionError: false });

    handleDescriptionBlur = async () => {
      if (this.props.description !== this.state.description) {
        this.setState({ savingDescription: true })
        const res = await this.props.patchPage({
          description: this.state.description
        })
        this.setState({
          savingDescription: false,
          descriptionError: res.ok ? null : res.data
        })
      }
    };
  }
)

const styles = StyleSheet.create({
  pageMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 16
  },
  title: {
    ...font.display2,
    width: '100%',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: colors.darkgray
  },
  description: {
    ...font.title,
    width: '100%',
    alignSelf: 'flex-start',
    marginBottom: 16,
    whiteSpace: 'pre-wrap',
    color: colors.darkgray
  },
  editable: {
    padding: 3,
    borderBottom: '1px solid transparent',
    cursor: 'pointer',
    ':active': {
      cursor: 'text'
    },
    ':hover': {
      borderBottom: `1px solid ${colors.brandgreen}`
    },
    ':focus': {
      borderBottom: `1px solid ${colors.brandgreen}`,
      cursor: 'text'
    }
  },
  isEditing: {
    cursor: 'initial'
  },
  textClassName: {
    whiteSpace: 'pre-wrap'
  },
  placeholderClassName: {
    textAlign: 'center',
    alignSelf: 'center',
    color: colors.lightgray
  }
})
