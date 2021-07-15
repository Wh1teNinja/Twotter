const http = require("http");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
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

// configure server
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(sessionMiddleware);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

app.use("/login", loginController);
app.use("/registration", notAuthenticated, registrationController);

app.get("/", (req, res) => {
  res.json("it works");
});

server.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
