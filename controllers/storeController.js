const Home = require("../models/home");
const User = require("../models/user");

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

exports.getBooked = (req, res, next) => {
  const userId = req.session.user._id;
  User.findById(userId)
    .populate("bookings")
    .then((user) => {
      res.render("store/booked", {
        bookedHomes: user.bookings,
        pageTitle: "My Booked Homes",
        currentPage: "booked",
        isLoggedIn: req.isLoggedIn, 
        user: req.session.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getBookHome = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId)
    .then(home => {
      if (!home) {
        return res.redirect('/homes');
      }
      res.render('store/booked', {
        home: home,
        pageTitle: 'Book Home',
        currentPage: 'book',  // yeh line zaroori hai
        isLoggedIn: req.isLoggedIn,
        user: req.session.user
      });
    })
    .catch(err => {
      console.error(err);
      res.redirect('/homes');
    });
};


exports.postBookHome = async (req, res, next) => {
  const { homeId, bookingDate, fullName, email, phone, nationality, cnic, passport, paymentMethod } = req.body;
  const userId = req.session.user._id;

  try {
    const user = await User.findById(userId);

    // Avoid duplicate booking
    if (!user.bookings.includes(homeId)) {
      user.bookings.push(homeId);
      await user.save();
    }

    // Optionally store full booking info in Booking model here

    res.redirect("/bookings"); // Or show confirmation page
  } catch (err) {
    console.log("Booking Error:", err);
    res.redirect("/homes");
  }
};


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

exports.postCancelBooking = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;

  try {
    const user = await User.findById(userId);
    user.bookings = user.bookings.filter(id => id.toString() !== homeId);
    await user.save();

    res.redirect("/bookings");
  } catch (err) {
    console.log("Cancel Booking Error:", err);
    res.redirect("/bookings");
  }
};


exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');
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
    user.favourites = user.favourites.filter(fav => fav != homeId);
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