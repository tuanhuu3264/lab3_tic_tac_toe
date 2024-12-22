import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import cookieParser from "cookie-parser";
import User from "../models/user.js";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "16f20737f84f2a1691f22a732b0a2e52342ea1e313432fe7d673df8b438fae7403d28fe5beefc5c7b87794730ef917a613b40fbbd7d05a4f3f2f10d650e531acc453f1138b59ea564c5c03e4ae906e01172e427781ff82baf3454bef1eec21971a7f75eb055619637850cb24f4e5d170db6f2e6fca8d0505905c4445951f4e17eb2c2ee9e1fd90d6a98bd13a3653aecec3251435a646473e8bb002254ac6d781ec249efb646d9266f4a1e4576786067f286acf88c354ab2226a87f0136833ff922323f3ff8e87d2c71ea6ec7f795c814cf8d5ae36dc4328bf35243282d9032db9135ced698e39a219cbc606ab1707ca34722ed18efe7c207bb091e3081d6a197";
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.jwt;
  }
  return token;
};

passport.use(
  new Strategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: JWT_SECRET,
    },
    async (jwt_payload, done) => {
      try {
        if (!jwt_payload || !jwt_payload.userId) {
          return done(null, false, { message: "Invalid token payload" });
        }
            
        const user = await User.findById(jwt_payload.userId);
        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        return done(null, user);
      } catch (err) {
        console.error("Error in passport strategy", err);
        return done(err, false, { message: "Authentication failed" });
      }
    }
  )
);

export default passport;
