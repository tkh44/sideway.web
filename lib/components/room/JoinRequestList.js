import { css, StyleSheet } from 'aphrodite/no-important'
import JoinRequest from 'room/JoinRequest'

export default ({ requestList, roomId }) => {
  return (
    <div className={css(styles.requestList)}>
      {requestList.map((request, i) => {
        return (
          <JoinRequest
            key={'join-request-' + i + '-' + request.id}
            userAccount={request.id}
            roomId={roomId}
            request={request}
          />
        )
      })}
    </div>
  )
}

const styles = StyleSheet.create({
  requestList: {
    display: 'flex',
    flexDirection: 'column'
  }
})
