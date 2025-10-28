import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getClient } from "./dbConnect";

const client = await getClient();

export const auth = betterAuth({
  database: mongodbAdapter(client),
  // trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },

  socialProviders: { 
        google: {
            clientId: process.env.GOOGLE_AUTH_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET || "",
            mapProfileToUser(profile) {
                return {
                    email: profile.email,
                    username: profile.email.split("@")[0],
                    name: profile.name,
                    image: profile.picture,
                };
            },  
            scope:[
              "openid",
              "email",
              "profile",
              "https://www.googleapis.com/auth/gmail.readonly",
              // "https://mail.google.com/"
            ]          
        },    
    },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
});