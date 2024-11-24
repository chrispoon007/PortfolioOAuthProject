const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secure-key",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport setup
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn(
    "Warning: Google Client ID or Secret is missing. Using fallback strategy."
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      if (process.env.GOOGLE_CLIENT_ID === "dummy-client-id") {
        // Fallback mock user for development
        const mockUser = {
          id: "123456",
          displayName: "Test User",
          emails: [{ value: "test@example.com" }],
        };
        return done(null, mockUser);
      }
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

// Authentication Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

// Mock Login Route for Development
app.get("/auth/mock-login", (req, res) => {
  const mockUser = {
    id: "123456",
    displayName: "Test User",
    emails: [{ value: "test@example.com" }],
  };
  req.login(mockUser, (err) => {
    if (err) {
      return res.status(500).send("Mock login failed");
    }
    res.redirect("/");
  });
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
  if (process.env.GOOGLE_CLIENT_ID === "dummy-client-id") {
    // Bypass authentication for development
    req.user = {
      id: "123456",
      displayName: "Test User (BYPASSED AUTH FOR DEVELOPMENT)",
      emails: [{ value: "test@example.com" }],
    };
    return next();
  }
  if (req.isAuthenticated()) return next();
  res.redirect("/login"); // Redirect to login page
}

// Routes
app.get("/", (req, res) => res.render("index", { user: req.user }));
app.get("/about", ensureAuthenticated, (req, res) =>
  res.render("about", { user: req.user })
);
app.get("/projects", ensureAuthenticated, (req, res) =>
  res.render("projects", { user: req.user })
);

// Login Page
app.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

app.get("/github-contributions", ensureAuthenticated, (req, res) => {
    res.render("github-contributions", { user: req.user });
  });
  
// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
