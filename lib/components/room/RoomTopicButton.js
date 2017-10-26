import Icon from 'art/Icon'
import Button from 'ui/Button'

export default function RoomTopicButton ({ onClick, style }) {
  return (
    <Button
      style={style}
      iconOnly
      onClick={onClick}
      tooltip='Add an Announcement'
    >
      <Icon
        name='flag'
        style={{
          width: 32,
          height: 32
        }}
      />
    </Button>
  )
}
