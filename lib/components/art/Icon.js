import { PureComponent } from 'react'

// We can use `import` here later if we want but for now this works
const createIcon = filename => {
  return require(`!babel-loader!svg-react-loader!../../public/images/svg/${filename}`)
}

const ICON_NAMES = {
  add: createIcon('plus.svg'),
  'arrow-down': createIcon('arrow-down.svg'),
  'arrow-up': createIcon('arrow-up.svg'),
  'bar-chart': createIcon('bar-chart.svg'),
  'button-circle-cross': createIcon('button-circle-cross.svg'),
  calendar: createIcon('calendar.svg'),
  checked: createIcon('checked.svg'),
  clock: createIcon('time-clock.svg'),
  close: createIcon('cross.svg'),
  'create-new': createIcon('create-new.svg'),
  email: createIcon('mail.svg'),
  facebook: createIcon('facebook.svg'),
  flag: createIcon('flag.svg'),
  horn: createIcon('horn-promote.svg'),
  image: createIcon('image.svg'),
  lock: createIcon('lock.svg'),
  logo: createIcon('logo.svg'),
  mail: createIcon('mail.svg'),
  medium: createIcon('medium.svg'),
  minus: createIcon('minus.svg'),
  paperbox: createIcon('paperbox.svg'),
  pause: createIcon('pause.svg'),
  pencil: createIcon('pencil.svg'),
  'photo-camera': createIcon('photo-camera.svg'),
  play: createIcon('play.svg'),
  quotes: createIcon('quotes.svg'),
  'remove-user': createIcon('remove-user.svg'),
  sideway: createIcon('sideway.svg'),
  'speech-bubbles': createIcon('speech-bubbles.svg'),
  'square-cross': createIcon('square-cross.svg'),
  'square-minus-min': createIcon('square-minus-min.svg'),
  'square-plus-max-medical': createIcon('square-plus-max-medical.svg'),
  'switch': createIcon('switch.svg'),
  'text-file': createIcon('text-file.svg'),
  'time-alarm': createIcon('time-alarm.svg'),
  trash: createIcon('trash.svg'),
  twitter: createIcon('twitter.svg'),
  unchecked: createIcon('unchecked.svg'),
  unlocked: createIcon('unlocked.svg')
}

export default class Icon extends PureComponent {
  render () {
    const { name, fill = 'currentColor', style, ...rest } = this.props

    const icon = ICON_NAMES[name]

    if (!icon) {
      console.error(`The icon "${name}" does not exist.`)
      return null
    }

    return React.createElement(icon, {
      ...rest,
      style: { fill, transition: 'fill 200ms ease', ...style }
    })
  }
}
