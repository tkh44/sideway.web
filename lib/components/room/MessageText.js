import FormattedText from 'ui/FormattedText'
import EditedIndicator from 'room/EditedIndicator'

export default function MessageText (
  { isEditing = false, isHighlighted = false, message }
) {
  return (
    <FormattedText
      text={message.text}
      links={message.links}
      hideEmbedOnlyBorder={message.comment}
      highlighted={isHighlighted}
      removeLinkOnlyText={message.linkOnly}
      editable={isEditing}
    >
      {message.original && <EditedIndicator message={message} />}
    </FormattedText>
  )
}
