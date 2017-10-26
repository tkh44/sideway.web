import svgIcon from 'art/SvgIcon'

const StarIcon = svgIcon(
  props => {
    return (
      <svg viewBox='0 0 256 256' {...props}>
        <path
          d='M128 32.74l20.56 66.54h66.55l-53.83 41.12 20.57 66.54L128 165.8l-53.84 41.14 20.57-66.54L40.9 99.28h66.53z'
        />
      </svg>
    )
  },
  'star-icon'
)

export default StarIcon
