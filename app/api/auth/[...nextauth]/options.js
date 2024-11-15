import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import mongodbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';

export const authOptions = {
  providers: [
    Providers.Credentials({
      // LINE OAuth Provider
      id: 'line',
      name: 'LINE',
      type: 'oauth',
      version: '2.0',
      wellKnown: 'https://access.line.me/.well-known/openid-configuration',
      clientId: process.env.LINE_CHANNEL_ID, // Your LINE Channel ID
      clientSecret: process.env.LINE_CHANNEL_SECRET, // Your LINE Channel Secret
      authorization: {
        url: 'https://access.line.me/oauth2/v2.1/authorize',
        params: {
          response_type: 'code',
          scope: 'profile openid',
          nonce: 'unique_nonce', // Unique identifier for each request
        },
      },
      token: 'https://api.line.me/oauth2/v2.1/token',
      userinfo: 'https://api.line.me/v2/profile',
      profile(profile) {
        // Map profile from LINE response
        return {
          id: profile.userId,
          name: profile.displayName,
          email: null, // LINE doesn't provide email by default
          image: profile.pictureUrl,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Secure secret for token signing
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Append LINE OAuth data to token
      if (account && profile) {
        token.id = profile.userId;
        token.name = profile.displayName;
        token.picture = profile.pictureUrl;
      }
      return token;
    },
    async session({ session, token }) {
      // Add token data to session
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.image = token.picture;
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      // Ensure user is stored in MongoDB after login
      await mongodbConnect();
      const existingUser = await User.findOne({ lineUserId: profile.userId });
      if (!existingUser) {
        await User.create({
          lineUserId: profile.userId,
          username: '', // This can be populated later by the user
          password: '', // This can be populated later by the user
        });
      }
    },
  },
  pages: {
    signIn: '/login', // Redirect to your custom login page
    error: '/error', // Redirect to a custom error page
  },
};

export default NextAuth(authOptions);
