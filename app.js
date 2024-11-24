const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const fs = require("fs").promises;
const path = require("path");
const multer = require("multer");
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
    cookie: { secure: false } // Set to true if using HTTPS
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Passport setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

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
    req.session.save(() => {
      res.redirect("/");
    });
  }
);

// Logout Route
app.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
});

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login"); // Redirect to login page
}

// Helper function to read projects from JSON file
async function readProjects() {
  const data = await fs.readFile(path.join(__dirname, "data", "projects.json"), "utf8");
  return JSON.parse(data);
}

// Helper function to write projects to JSON file
async function writeProjects(projects) {
  await fs.writeFile(
    path.join(__dirname, "data", "projects.json"),
    JSON.stringify(projects, null, 2)
  );
}

// Helper function to read user data from JSON file
async function readUserData() {
  const data = await fs.readFile(path.join(__dirname, "data", "users.json"), "utf8");
  return JSON.parse(data);
}

// Helper function to write user data to JSON file
async function writeUserData(users) {
  await fs.writeFile(
    path.join(__dirname, "data", "users.json"),
    JSON.stringify(users, null, 2)
  );
}

// Helper function to read GitHub data from JSON file
async function readGitHubData() {
  const data = await fs.readFile(path.join(__dirname, "data", "github.json"), "utf8");
  return JSON.parse(data);
}

// Helper function to write GitHub data to JSON file
async function writeGitHubData(githubData) {
  await fs.writeFile(
    path.join(__dirname, "data", "github.json"),
    JSON.stringify(githubData, null, 2)
  );
}

// Routes
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("index", { user: req.user });
  } else {
    res.render("index", { user: null });
  }
});

app.get("/about", ensureAuthenticated, async (req, res) => {
  const users = await readUserData();
  const user = users[req.user.id] || req.user;
  res.render("about", { user });
});

app.post("/edit/about", ensureAuthenticated, async (req, res) => {
  const { personalIntroduction, skillsExpertise, professionalExperience, education, contactInformation } = req.body;
  const users = await readUserData();
  users[req.user.id] = {
    ...users[req.user.id],
    personalIntroduction,
    skillsExpertise,
    professionalExperience,
    education,
    contactInformation
  };
  await writeUserData(users);
  req.session.save(() => {
    res.redirect("/about");
  });
});

// Upload Photo Route
app.post("/upload/photo", ensureAuthenticated, upload.single("profilePhoto"), async (req, res) => {
  const users = await readUserData();
  const user = users[req.user.id];

  // Delete the previous photo if it exists
  if (user.photo) {
    const previousPhotoPath = path.join(__dirname, "public", user.photo);
    try {
      await fs.unlink(previousPhotoPath);
    } catch (err) {
      console.error("Error deleting previous photo:", err);
    }
  }

  // Save the new photo
  user.photo = `/uploads/${req.file.filename}`;
  await writeUserData(users);
  req.session.save(() => {
    res.redirect("/about");
  });
});

app.get("/projects", ensureAuthenticated, async (req, res) => {
  const projects = await readProjects();
  const userProjects = projects[req.user.id] || [];
  res.render("projects", { user: req.user, projects: userProjects });
});

// Add Project Routes
app.get("/add/projects", ensureAuthenticated, async (req, res) => {
  const projects = await readProjects();
  const userProjects = projects[req.user.id] || [];
  res.render("edit-projects", { user: req.user, projects: userProjects });
});

app.post("/add/projects", ensureAuthenticated, async (req, res) => {
  const { projectTitle, projectDescription } = req.body;
  const projects = await readProjects();
  const userProjects = projects[req.user.id] || [];
  userProjects.push({ name: projectTitle, description: projectDescription });
  projects[req.user.id] = userProjects;
  await writeProjects(projects);
  req.session.save(() => {
    res.redirect("/projects");
  });
});

// Edit Project Route
app.post("/edit/projects", ensureAuthenticated, async (req, res) => {
  const { projectId, projectTitle, projectDescription } = req.body;
  const projects = await readProjects();
  const userProjects = projects[req.user.id] || [];
  
  if (userProjects[projectId]) {
    userProjects[projectId].name = projectTitle;
    userProjects[projectId].description = projectDescription;
    projects[req.user.id] = userProjects;
    await writeProjects(projects);
  }
  
  req.session.save(() => {
    res.redirect("/projects");
  });
});

// Delete Project Route
app.post("/delete/projects", ensureAuthenticated, async (req, res) => {
  const { projectId } = req.body;
  const projects = await readProjects();
  const userProjects = projects[req.user.id] || [];
  
  if (userProjects[projectId]) {
    userProjects.splice(projectId, 1);
    projects[req.user.id] = userProjects;
    await writeProjects(projects);
  }
  
  req.session.save(() => {
    res.redirect("/projects");
  });
});

// Edit GitHub Username Route
app.post("/edit/github-username", ensureAuthenticated, async (req, res) => {
  const { githubUsername } = req.body;
  const githubData = await readGitHubData();
  githubData[req.user.id] = {
    githubUsername
  };
  await writeGitHubData(githubData);
  req.session.save(() => {
    res.redirect("/github-contributions");
  });
});

// GitHub Contributions Page
app.get("/github-contributions", ensureAuthenticated, async (req, res) => {
  const users = await readUserData();
  const githubData = await readGitHubData();
  const user = users[req.user.id] || req.user;
  user.githubUsername = githubData[req.user.id]?.githubUsername || null;
  res.render("github-contributions", { user });
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));