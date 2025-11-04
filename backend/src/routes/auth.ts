// backend/src/routes/auth.ts
import express from 'express'
import passport from 'passport'
import { AuthController } from '../controllers/AuthController'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()
const authController = new AuthController()

// Get current user
router.get('/me', authMiddleware, authController.getCurrentUser)

// Social authentication routes
router.get(
  '/social/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)
router.get(
  '/social/github',
  passport.authenticate('github', {
    scope: ['user:email'],
  })
)

// Social authentication callbacks
router.get(
  '/social/google/callback',
  passport.authenticate('google', { session: false }),
  authController.socialAuthCallback
)
router.get(
  '/social/github/callback',
  passport.authenticate('github', { session: false }),
  authController.socialAuthCallback
)

// Logout
router.post('/logout', authController.logout)

export default router
