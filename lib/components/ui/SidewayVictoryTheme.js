import { breakpoints, colors, font } from 'style'

const strokeLinecap = 'round'
const strokeLinejoin = 'round'

export const baseLabelStyles = {
  fontFamily: font.sansSerifFamily,
  fontSize: 22,
  letterSpacing: 'normal',
  padding: 10,
  fill: colors.lightgray,
  stroke: 'transparent'
}

export default {
  axis: {
    width: breakpoints.desktop,
    height: breakpoints.phone,
    padding: 16,
    domainPadding: 0,
    style: {
      axis: {
        fill: 'transparent',
        stroke: colors.faintgray,
        strokeWidth: 0.5,
        strokeLinecap,
        strokeLinejoin
      },
      axisLabel: {
        ...baseLabelStyles,
        textAnchor: 'middle',
        padding: 0
      },
      grid: {
        fill: 'transparent',
        stroke: 'transparent',
        strokeDasharray: '10, 5',
        strokeWidth: 1,
        strokeLinecap,
        strokeLinejoin
      },
      ticks: {
        fill: 'transparent',
        size: 1,
        stroke: 'transparent'
      },
      tickLabels: {
        ...baseLabelStyles,
        padding: 2
      }
    }
  }
}
