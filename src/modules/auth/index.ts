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
  getSessionUser,
  signUpAction,
  loginAction,
  logoutAction,
  selectProfileAction,
  verifyPinAction,
} from './actions'

export type { AccessTokenPayload as SessionUser } from '@/lib/jwt'
