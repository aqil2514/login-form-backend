const { Users } = require("./utils/db.js");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const bcrypt = require("bcrypt");

app.use(expressLayouts);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", "./views");
app.set("view engine", "ejs");

// Konfigurasi expressLayouts
app.set("layout", "layouts/main");
app.set("layout extractScripts", true);

app.get("/", async (req, res) => {
  try {
    const data = await Users.findAll();

    const options = {
      title: "Home",
      data,
    };

    res.render("home", options);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/login", (req, res) => {
  const options = {
    title: "Login",
  };

  res.render("login", options);
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      console.log("User tidak ada");
      res.redirect("/login");
      return;
    }

    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      console.log("Password salah!");
      res.redirect("/login");
      return;
    }

    res.cookie("user", user.name, { maxAge: 60000, httpOnly: true, secure: true });
    res.redirect("/admin");
  } catch (error) {
    console.error(error);
  }
});

app.get("/admin", async (req, res) => {
  try {
    const { user } = req.cookies;
    const options = {
      title: "Admin",
    };

    if (!user) {
      console.log("Anda belum login");
      res.redirect("/login");
      return;
    }

    console.log(user);

    res.render("admin", options);
  } catch (error) {
    console.log(error);
  }
});

app.get("/register", (req, res) => {
  const options = {
    title: "Register",
  };

  res.render("register", options);
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await Users.create({
      name,
      email,
      password: hashedPassword,
    });

    res.redirect("/register");
  } catch (error) {
    // Menangani kesalahan
    console.error("Error during user registration:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => console.log(`Server berjalan di http://localhost:3000`));
