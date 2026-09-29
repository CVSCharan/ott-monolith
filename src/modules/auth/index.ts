/**
 * Public API for the Auth Module.
 * External modules and components must only import from this file.
 */

export {
  registerAccount,
  authenticate,
  rotateSession,
  verifyParentalPin,
  selectActiveProfile,
  hashPassword,
  verifyPassword,
} from './service'

export {
  requireSession,
  requireAdmin,
  signUpAction,
  loginAction,
  logoutAction,
  selectProfileAction,
  verifyPinAction,
} from './actions'
