import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import mongodbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';
import liff from '@line/liff';

export const options = {
  providers: [
    CredentialsProvider({
      id: 'line',
      name: 'LINE',
      type: 'oauth',
      version: '2.1',
      clientId: process.env.LINE_CHANNEL_ID, // Your LINE Channel ID
      clientSecret: process.env.LINE_CHANNEL_SECRET, // Your LINE Channel Secret
      authorization: {
        url: 'https://access.line.me/oauth2/v2.1/authorize',
        params: {
          response_type: 'code',
          scope: 'profile openid',
          nonce: 'unique_nonce',
        },
      },
      token: 'https://api.line.me/oauth2/v2.1/token',
      userinfo: 'https://api.line.me/v2/profile',
      async profile(profile) {
        // Profile mapping from LINE OAuth
        return {
          id: profile.userId,
          name: profile.displayName,
          email: null, // Email is not provided in LINE profile by default
          image: profile.pictureUrl,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Ensure a secure secret for JWT tokens
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Automatically handle the LIFF login session via JWT token
      if (account && profile) {
        token.id = profile.userId;
        token.name = profile.displayName;
        token.picture = profile.pictureUrl;
      }
      return token;
    },
    async session({ session, token }) {
      // Append user data to session
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.image = token.picture;
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      // Ensure the user is stored in the database after successful sign-in
      await mongodbConnect();
      const existingUser = await User.findOne({ lineUserId: profile.userId });
      if (!existingUser) {
        await User.create({
          lineUserId: profile.userId,
          username: '', // Placeholder for username
          password: '', // Placeholder for password
        });
      }
    },
  },
  pages: {
    signIn: 'https://liff.line.me/2006561325-nAPmNdbv', // Redirect to your LIFF login page
    error: '/error', // Handle errors here
  },
  async adapter() {
    // Configure LIFF initialization within NextAuth
    await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });

    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      return {
        id: profile.userId,
        name: profile.displayName,
        image: profile.pictureUrl,
      };
    } else {
      liff.login();
    }
  },

  async getProfileFromLIFF() {
    await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
    if (liff.isLoggedIn()) {
      const profileData = await liff.getProfile();
      return profileData;
    }
    return null;
  },
};

export default options;
