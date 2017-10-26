import Icon from 'art/Icon'
import Button from 'ui/Button'

export default function ImageUploadButton ({ onClick, style }) {
  return (
    <Button
      style={style}
      tooltip='Upload Image'
      iconOnly
      onClick={onClick}
    >
      <Icon
        name='image'
        style={{
          width: 32,
          height: 32
        }}
      />
    </Button>
  )
}
