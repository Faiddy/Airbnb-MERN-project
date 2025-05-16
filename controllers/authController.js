const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");


exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
  currentPage: "login",
  isLoggedIn: false,
  errors: [],
  oldInput: {
    email: "",
  },
  user:{},
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    currentPage: "signup",
    isLoggedIn: false,
    errors: [],
    oldInput: {
      firstName: "",
      lastName: "",
      email: "",
      userType: "",
    },
    user:{},
  });
};

exports.postSignup = [
  check("firstName")
    .isLength({ min: 2 })
    .withMessage("First name should be atleast 2 characters long")
    .trim()
    .matches(/^[a-zA-Z ]+$/),

    check("lastName")
    .matches(/^[a-zA-Z ]*$/)
    .withMessage("Last name should only contain alphabets"),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

    check("password")
    .isLength({ min: 8 })
    .withMessage("Password should be atleast 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage("Password should contain atleast one uppercase letter, one lowercase letter, one specail character and one number")
    .trim(),

    check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

    check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(["guest", "host"])
    .withMessage("Please select a valid user type"),

    check("terms")
    .notEmpty()
    .withMessage("Please accept the terms and conditions")
    .custom((value, { req }) => {
      if (value !== "on") {
        throw new Error("Please accept the terms and conditions");
      }
      return true;
    }),
  
  (req, res, next) => {
    const {firstName,lastName,email,password,userType}=req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: errors.array(),
        oldInput: {
          firstName,
          lastName,
          email,
          password,
          userType,
        },
        user:{},
      });
    }
    bcrypt.hash(password, 12).then((hashedPassword) => {
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        userType
      });
      return user.save();
    })
    .then(() =>{
      res.redirect("/login");
    }).catch(err => {
      console.log(err);
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: [err.message],
        oldInput: {
          firstName,
          lastName,
          email,
          password,
          userType
        },
        user:{},
      });
    });
    
  }]


exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: [{ msg: "Invalid email or password" }],
      oldInput: {
        email,
            },
            user:{},
    });
  }
const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: [{ msg: "Invalid email or password" }],
      oldInput: {
        email,
            },
            user:{},
    });
  }
  req.session.isLoggedIn = true;
  req.session.user = user;
  await req.session.save();
  res.redirect("/");
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
      res.redirect("/login")
  })
}

