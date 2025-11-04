import passport from 'passport'
import {
  Strategy as GoogleStrategy,
  type Profile as GoogleProfile,
} from 'passport-google-oauth20'
import {
  Strategy as GitHubStrategy,
  type Profile as GitHubProfile,
} from 'passport-github2'
import { prisma } from '../lib/prisma'

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/social/google/callback',
    },
    async (accessToken, refreshToken, profile: GoogleProfile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        const avatar = profile.photos?.[0]?.value
        const name = profile.displayName

        console.log({ email, avatar, name })

        if (!email)
          return done(new Error('No email returned from Google'), undefined)

        let user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: name ?? 'Unknown User',
              avatar: avatar ?? '',
            },
          })
        }

        return done(null, user)
      } catch (error) {
        return done(error as Error, undefined)
      }
    }
  )
)

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: '/api/auth/social/github/callback',
      scope: ['user:email'],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GitHubProfile & { _json?: any },
      done: (error: any, user?: any) => void
    ) => {
      console.log('profile', profile)
      try {
        console.log('GitHub profile received:', {
          id: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          emailCount: profile.emails?.length || 0,
        })

        // Extract user information with fallbacks
        const email = profile.emails?.[0]?.value
        const avatar = profile.photos?.[0]?.value || profile._json.avatar_url
        const name =
          profile.displayName ||
          profile._json.name ||
          profile.username ||
          'GitHub User'

        console.log('Processed user data:', {
          email,
          name,
          hasAvatar: !!avatar,
        })

        if (!email)
          return done(new Error('No email returned from GitHub'), undefined)

        let user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name,
              avatar: avatar ?? '',
            },
          })
        }

        return done(null, user)
      } catch (error) {
        return done(error as Error, undefined)
      }
    }
  )
)

// ✅ Serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})
