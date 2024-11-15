import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
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
      if (account && profile) {
        token.id = profile.userId;
        token.name = profile.displayName;
        token.picture = profile.pictureUrl;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.image = token.picture;
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      // LIFF login handling can be done here, but no need to handle user creation with MongoDB
    },
  },
  pages: {
    signIn: 'https://liff.line.me/2006561325-nAPmNdbv', // Redirect to your LIFF login page
    error: '/error', // Handle errors here
  },
  async adapter() {
    // Initialize LIFF
    await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });

    // Check if the user is logged in via LIFF
    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      return {
        id: profile.userId,
        name: profile.displayName,
        image: profile.pictureUrl,
      };
    } else {
      liff.login(); // Trigger login if not logged in
    }
  },
  async signOut() {
    // Handle sign-out using LIFF
    liff.logout();
  }
};

export default options;
