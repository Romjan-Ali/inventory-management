// backend/src/controllers/AuthController.ts
import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { AuthRequest } from '../middleware/auth'

const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export class AuthController {
  async getCurrentUser(req: AuthRequest, res: Response) {
    res.json({
      user: req.user,
      token: generateToken(req.user.id),
    })
  }

  async socialAuthCallback(req: AuthRequest, res: Response) {
    // This will be called after successful social authentication
    const token = generateToken(req.user.id)

    console.log( 'token:', token )

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`)
  }

  async logout(req: Request, res: Response) {
    res.json({ message: 'Logged out successfully' })
  }
}
