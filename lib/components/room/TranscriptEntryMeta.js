import cn from 'classnames'
import TimeAgo from 'react-timeago'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import AvatarWithPopover from 'ui/AvatarWithPopover'
import DisplayName from 'ui/DisplayName'
import { dateToString, timeAgoFormatter } from 'utils/date'

export default function TranscriptEntryMeta (
  { blogMode, children, className, user, timestamp }
) {
  return (
    <div
      className={cn(
        css(styles.meta, blogMode && styles.metaBlogMode),
        className
      )}
    >
      <AvatarWithPopover
        className={css(styles.avatar, blogMode && styles.avatarBlogMode)}
        size={blogMode ? 'large' : 'small'}
        user={user}
      />
      <div
        className={css(
          styles.metaWrapper,
          blogMode && styles.metaWrapperBlogMode
        )}
      >
        <DisplayName
          className={css(
            styles.displayName,
            blogMode && styles.displayNameBlogMode
          )}
          user={user}
        />
        {timestamp &&
          <div className={css(styles.timeStamp)}>
            <TimeAgo
              date={timestamp}
              live
              minPeriod={5}
              formatter={timeAgoFormatter}
              title={dateToString(new Date(timestamp))}
            />
          </div>}
      </div>
      {children &&
        <div className={css(styles.toolbar)}>
          {children}
        </div>}
    </div>
  )
}

const styles = StyleSheet.create({
  meta: {
    display: 'flex',
    alignItems: 'center',
    height: 36,
    paddingBottom: 4
  },
  metaBlogMode: {
    height: 52,
    paddingBottom: 8
  },
  metaWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  metaWrapperBlogMode: {
    alignItems: 'flex-start',
    flexDirection: 'column'
  },
  infoWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  avatar: {
    height: 24,
    width: 24,
    margin: 0
  },
  avatarBlogMode: {
    height: 36,
    width: 36
  },
  displayName: {
    ...font.caption,
    marginLeft: 8,
    color: colors.lightgray,
    ':hover': {
      color: colors.brandgreen
    }
  },
  displayNameBlogMode: {
    ...font.body2,
    color: colors.darkgray
  },
  timeStamp: {
    ...font.caption,
    marginLeft: 8,
    color: colors.lightgray
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto'
  }
})
