const http = require("http");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const MongoStore = require("connect-mongo");
const db = require("./model/db");

const app = express();

const server = http.createServer(app);

require("dotenv").config({ path: "./configs/.env" });

const PORT = process.env.PORT || 8000;

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongoUrl: `mongodb+srv://${process.env.DB_LOGIN}:${process.env.DB_PASSWORD}@cluster0.7guft.mongodb.net/twotter-sessions?retryWrites=true&w=majority`,
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  },
});

// passport configuration
passport.use(
  new LocalStrategy((username, password, done) => {
    db.authenticateUser({ username, password })
      .then((user) => {
        return done(null, user);
      })
      .catch((err) => {
        if (err instanceof Error) return done(err);
        else return done(null, false, err);
      });
  })
);
passport.serializeUser(function (user, done) {
  done(null, user._id);
});
passport.deserializeUser(function (id, done) {
  db.getUserById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, false);
    });
});

// configure server
app.enable("trust proxy");
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(sessionMiddleware);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// connect database
db.initialize()
  .then(() => {
    console.log("Database connection established!");
  })
  .catch((err) => {
    console.log("Error ocurred while connecting to the database: " + err);
  });

// get all the controllers
const loginController = require("./controllers/login");
const registrationController = require("./controllers/registration");
const chatController = require("./controllers/chat");

const chatSocket = require("./controllers/chat-socket");

const io = require("socket.io")(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
});
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});
io.on("connection", chatSocket.initialize);

const notAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) res.json({ message: "Already authenticated" });
  else next();
};
const authenticated = (req, res, next) => {
  if (!req.isAuthenticated())
    res.json({ message: "Not Authenticated" + req.session.id });
  else next();
};

app.use("/login", notAuthenticated, loginController);
app.use("/registration", notAuthenticated, registrationController);
app.use("/chat", authenticated, chatController);

app.get("/", authenticated, (req, res) => {
  res.json(req.user);
});

server.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});