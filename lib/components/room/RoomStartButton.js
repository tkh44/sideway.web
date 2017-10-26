import compose from 'recompose/compose'
import withState from 'recompose/withState'
import withHandlers from 'recompose/withHandlers'
import { css, StyleSheet } from 'aphrodite/no-important'
import { colors, font } from 'style'
import Button from 'ui/Button'
import Confirm from 'ui/Confirm'
import { roomActions } from 'redux/rooms'

export default compose(
  withState('startState', 'updateState', {
    confirming: false,
    submitting: false,
    startError: false
  }),
  withHandlers({
    setConfirm: ({ updateState }) =>
      () =>
        updateState(prevState => {
          return {
            confirming: !prevState.confirming,
            submitting: false,
            startError: false
          }
        }),
    setRoomActive: ({ dispatch, roomId, updateState }) =>
      async () => {
        updateState({ confirming: true, submitting: true, startError: false })
        const { ok } = await dispatch(
          roomActions.patchRoom(roomId, { status: 'active' })
        )

        if (!ok) {
          updateState({
            confirming: true,
            submitting: false,
            startError: true
          })
        }
      }
  })
)(({ setConfirm, setRoomActive, startState }) => {
  const { confirming, submitting, startError } = startState

  return (
    <div className={css(styles.buttonWrapper)}>
      {startError &&
        <div className={css(styles.error)}>
          We could not start the conversation at this time
        </div>}
      {confirming &&
        <Confirm
          className={css(styles.confirm)}
          confirmButtonColor='brandgreen'
          message='Do you want to start the conversation right now?'
          onCancel={setConfirm}
          onConfirm={setRoomActive}
          cancelText='No'
          confirmText='Lets go!'
          style={{
            maxWidth: 256,
            width: '100%',
            marginTop: 0,
            marginRight: 'auto',
            marginBottom: 16,
            marginLeft: 'auto'
          }}
        />}
      {!confirming &&
        <Button
          color='brandgreen'
          style={{
            ...font.title,
            display: 'block',
            height: 44,
            maxWidth: 256,
            width: '100%',
            marginTop: 0,
            marginRight: 'auto',
            marginBottom: 16,
            marginLeft: 'auto'
          }}
          loading={submitting}
          disabled={submitting}
          type='button'
          onClick={setConfirm}
          label='Begin Your Conversation!'
        >
          Start Conversation
        </Button>}
    </div>
  )
})

const styles = StyleSheet.create({
  buttonWrapper: {
    width: '100%'
  },
  error: {
    ...font.caption,
    paddingBottom: 4,
    color: colors.red,
    textAlign: 'center'
  },
  confirm: {
    ...font.body1
  }
})
