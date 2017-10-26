export const emailRegex = /^[^@]+@(?:[^.]+.)+[^.]{2,}$/

export const isEmail = str => emailRegex.test(str)

export const isValidEmail = email => {
  return isEmail(email) && !checkEmailAddress(email)
}

export const validateName = name => {
  let nameError

  if (!name) {
    nameError = true
  } else if (name.length < 3) {
    nameError = 'too short'
  }

  return nameError
}

export const validateUsername = username => {
  let usernameError

  if (!username) {
    usernameError = true
  } else if (username.length < 2) {
    usernameError = 'Too short'
  } else if (username.length > 20) {
    usernameError = 'Too long'
  } else if (username.search(/^[a-zA-Z]/) !== 0) {
    usernameError = '1st character must be a letter'
  } else if (username.search(/^\w*$/) !== 0) {
    usernameError = 'Only letters, numbers and _'
  }

  return usernameError
}

export const checkEmailAddress = (address = '') => {
  if (address.length < 6) {
    return 'Address too short'
  }

  if (address.length > 64) {
    return 'Address too long'
  }

  if (
    address.match(
      /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/
    ) === null
  ) {
    // eslint-disable-line
    return 'Invalid email address format'
  }

  return ''
}

export const cleanPhoneNumber = number =>
  number.replace(/^\+\d/, '').replace(/[^\d]/g, '')
