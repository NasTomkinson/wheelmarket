import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type StrapiAuthResponse = {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    location?: string;
    blocked?: boolean;
    confirmed?: boolean;
  };
};

const strapiUrl = (process.env.STRAPI_URL ?? "http://localhost:1337").replace(/\/$/, "");
const developmentSecret = "wheelmarket-development-secret-change-before-production";

export const authOptions: NextAuthOptions = {
  secret:
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "development" ? developmentSecret : undefined),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Email or username",
      credentials: {
        identifier: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier?.trim();
        const password = credentials?.password;

        if (!identifier || !password) return null;

        const response = await fetch(`${strapiUrl}/api/auth/local`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password }),
          cache: "no-store",
        });

        if (!response.ok) return null;

        const data = (await response.json()) as StrapiAuthResponse;

        if (!data.jwt || !data.user || data.user.blocked) return null;

        return {
          id: String(data.user.id),
          name: data.user.username,
          email: data.user.email,
          username: data.user.username,
          location: data.user.location,
          strapiAccessToken: data.jwt,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.username = user.username;
        token.location = user.location;
        token.strapiAccessToken = user.strapiAccessToken;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.username = token.username;
        session.user.location = token.location;
      }

      return session;
    },
  },
};
