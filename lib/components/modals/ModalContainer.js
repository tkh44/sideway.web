import { Component } from 'react'
import { connect } from 'react-redux'
import SidewayModal from 'modals/SidewayModal'
import RegisterForm from 'modals/RegisterForm'
import LoginForm from 'modals/LoginForm'
import Account from 'modals/Account'

class ModalContainer extends Component {
  render () {
    const { modal } = this.props

    const {
      register,
      login,
      accountDetails
    } = modal

    return (
      <div>
        {register &&
          <SidewayModal
            isOpen={register.isOpen}
            onRequestClose={this.closeRegisterModal}
            shouldCloseOnOverlayClick={false}
            canClose={false}
          >
            <RegisterForm
              registerData={register.data}
              closeModal={this.closeRegisterModal}
            />
          </SidewayModal>}
        {login &&
          <SidewayModal
            isOpen={login.isOpen}
            onRequestClose={this.closeLoginModal}
            shouldCloseOnOverlayClick={false}
          >
            <LoginForm {...login.data} />
          </SidewayModal>}
        {accountDetails &&
          <SidewayModal
            isOpen={accountDetails.isOpen}
            onRequestClose={this.closeAccountDetails}
            shouldCloseOnOverlayClick={false}
            size='large'
          >
            <Account />
          </SidewayModal>}
      </div>
    )
  }

  handleModalRequestClose = modal => {
    const { dispatch } = this.props
    dispatch({ type: 'modal/HIDE', payload: { modal } })
  };

  closeLoginModal = () => this.handleModalRequestClose('login');

  closeRegisterModal = () => this.handleModalRequestClose('register');

  closeAccountDetails = () => this.handleModalRequestClose('accountDetails');
}

const mapStateToProps = (state, props) => {
  return {
    modal: state.modal
  }
}

export default connect(mapStateToProps)(ModalContainer)
