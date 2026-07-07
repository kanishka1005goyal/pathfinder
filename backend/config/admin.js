import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";

import User from "./models/User.js";
import Resume from "./models/Resume.js";

AdminJS.registerAdapter(AdminJSMongoose);

export const admin = new AdminJS({
  rootPath: "/admin",

  resources: [
    {
      resource: User,
      options: {
        navigation: "Users",
      },
    },
    {
      resource: Resume,
      options: {
        navigation: "Resume Management",
      },
    },
  ],

  branding: {
    companyName: "PathFinder AI",
    softwareBrothers: false,
  },
});

export const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate: async (email, password) => {
      if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
      ) {
        return { email };
      }
      return null;
    },
    cookieName: "admin",
    cookiePassword: process.env.COOKIE_SECRET,
  },
  null,
  {
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
  }
);