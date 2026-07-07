import AdminJS from "adminjs";
import * as AdminJSMongoose from "@adminjs/mongoose";
import AdminJSExpress from "@adminjs/express";

import User from "./models/User.js";
import Resume from "./models/Resume.js";

AdminJS.registerAdapter(AdminJSMongoose);

const admin = new AdminJS({
  resources: [
    User,
    Resume,
  ],
  rootPath: "/admin",
});

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate: async (email, password) => {
      if (
        email === "admin@gmail.com" &&
        password === "admin123"
      ) {
        return { email };
      }
      return null;
    },
    cookiePassword: "supersecret",
  }
);

export { admin, adminRouter };