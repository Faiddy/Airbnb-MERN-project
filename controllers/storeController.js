const Home = require("../models/home");
const User = require("../models/user");
const Booking = require("../models/booking");

exports.getIndex = (req, res, next) => {
  console.log("Session Value: ", req.session);
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getBookHome = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        return res.redirect("/homes");
      }
      res.render("store/book-home", {
        home: home,
        pageTitle: "Book Home",
        currentPage: "book",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/homes");
    });
};

// List all bookings for the current user
exports.getBookings = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate("bookings");
    res.render("store/bookings", {
      bookedHomes: user.bookings,
      pageTitle: "My Bookings",
      currentPage: "bookings",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.log("Error loading bookings:", err);
    res.redirect("/");
  }
};

exports.postBookHome = async (req, res, next) => {
  const {
    homeId,
    dateFrom,
    dateTo,
    fullName,
    email,
    phone,
    nationality,
    cnic,
    passport,
    paymentMethod,
  } = req.body;

  try {
    const newBooking = new Booking({
      home: homeId,
      user: req.session.user._id,
      dateFrom,
      dateTo,
      fullName,
      email,
      phone,
      nationality,
      cnic,
      passport,
      paymentMethod,
    });

    await newBooking.save();

    // Save booking reference to user
    const user = await User.findById(req.session.user._id);
    user.bookings.push(newBooking._id);
    await user.save();

    res.redirect("/bookings");
  } catch (err) {
    console.error("Booking Error:", err);
    res.redirect("/homes");
  }
};

exports.postCancelBooking = async (req, res, next) => {
  const bookingId = req.params.bookingId;
  const userId = req.session.user._id;

  try {
    const user = await User.findById(userId);
    user.bookings = user.bookings.filter(
      (id) => id.toString() !== bookingId.toString()
    );
    await user.save();

    // Optionally, delete booking from DB as well
    await Booking.findByIdAndDelete(bookingId);

    res.redirect("/bookings");
  } catch (err) {
    console.log("Cancel Booking Error:", err);
    res.redirect("/bookings");
  }
};

exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favourites");
  res.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter((fav) => fav != homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    }
  });
};
