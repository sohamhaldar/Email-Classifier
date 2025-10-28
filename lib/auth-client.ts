import { createAuthClient } from "better-auth/react";
// import { usernameClient,adminClient } from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";
// import { BaseUrl } from "./utils";



const auth=createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    plugins:[
    //   usernameClient(),
    //   adminClient()
    nextCookies()
    ]
  })

export const {signIn,signUp,useSession,changePassword,signOut,forgetPassword,resetPassword}=auth;