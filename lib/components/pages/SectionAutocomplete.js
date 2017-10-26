import { Component } from 'react'
import { get } from 'lodash'
import { css, StyleSheet } from 'aphrodite/no-important'
import Autosuggest from 'react-autosuggest'
import isMobile from 'ismobilejs'
import { colors, font, forms } from 'style'

const getSuggestions = (currentPage, value = '') => {
  const sections = get(currentPage, 'sections', [])
  const input = value.trim().toLowerCase()
  const length = input.length

  if (length === 0) {
    return []
  }

  return sections.filter(sec => sec.toLowerCase().indexOf(input) !== -1)
}

const getSuggestionValue = s => s

const Suggestion = suggestion => (
  <div>
    {suggestion}
  </div>
)

export default class SectionAutocomplete extends Component {
  constructor (props) {
    super(props)

    this.state = {
      suggestions: getSuggestions(props.page, props.value)
    }
  }

  render () {
    return (
      <Autosuggest
        focusFirstSuggestion
        focusInputOnSuggestionClick={!isMobile}
        suggestions={this.state.suggestions}
        onSuggestionsFetchRequested={this.handleSuggestionFetchRequested}
        onSuggestionsClearRequested={this.handleSuggestionClearRequested}
        renderSuggestion={Suggestion}
        getSuggestionValue={getSuggestionValue}
        inputProps={{
          name: 'section',
          placeholder: 'Section',
          value: this.props.value,
          onChange: this.props.onChange,
          required: true
        }}
        theme={{
          container: css(styles.container),
          input: css(styles.input),
          suggestionsContainer: css(styles.suggestionsContainer),
          suggestionsList: css(styles.suggestionsList),
          suggestion: css(styles.suggestion),
          suggestionFocused: css(styles.suggestionFocused)
        }}
      />
    )
  }

  handleSuggestionFetchRequested = ({ value }) => {
    this.setState({ suggestions: getSuggestions(this.props.page, value) })
  };

  handleSuggestionClearRequested = () => this.setState({ suggestions: [] });
}

const styles = StyleSheet.create({
  container: {
    ...forms.inputContainer
  },
  containerOpen: {},
  input: {
    ...forms.baseInput
  },
  suggestionsContainer: {
    display: 'block',
    position: 'absolute',
    top: 37,
    width: '100%',
    backgroundColor: colors.white,
    borderBottomRightRadius: 2,
    borderBottomLeftRadius: 2,
    zIndex: 1
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
    border: `1px solid ${colors.faintgray}`,
    borderTop: 'none'
  },
  suggestion: {
    ...font.body2,
    cursor: 'pointer',
    paddingTop: 8,
    paddingRight: 8,
    paddingBottom: 8,
    paddingLeft: 8
  },
  suggestionFocused: {
    backgroundColor: colors.faintgbrandgreen
  },
  sectionContainer: {},
  sectionTitle: {}
})
