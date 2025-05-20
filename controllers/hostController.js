const home = require("../models/home");
const Home = require("../models/home");
const fs = require("fs");
const Booking = require('../models/Booking');
const User = require('../models/user');

exports.getHostDashboard = async (req, res) => {
  try {
    const hostId = req.session.userId;

    // Get all bookings with their related home and user (guest)
    const bookings = await Booking.find()
      .populate({
        path: 'home',
        match: { host: hostId }, // only homes posted by this host
      })
      .populate('user'); // guest

    // Filter out bookings where the home didn't match the host
    const filteredBookings = bookings.filter(b => b.home !== null);

    const totalBookings = filteredBookings.length;
    const totalEarnings = filteredBookings.reduce((sum, b) => {
      return sum + (b.home.price || 0);
    }, 0);

    const upcomingBookings = filteredBookings
      .filter(b => new Date(b.dateFrom) >= new Date())
      .map(b => ({
        guestName: b.fullName,
        houseName: b.home.houseName,
        date: `${b.dateFrom.toDateString()} to ${b.dateTo.toDateString()}`,
        amount: b.home.price,
        paymentMethod: b.paymentMethod
      }));

    // Get host's payment method if stored in User model
    const host = await User.findById(hostId);

    res.render('host/host-dashboard', {
      totalBookings,
      totalEarnings,
      upcomingBookings,
      pageTitle: 'Host Dashboard',
      currentPage: 'host-dashboard',
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });

  } catch (err) {
    console.error('Error loading host dashboard:', err);
    res.status(500).send('Server Error');
  }
};



exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: req.isLoggedIn,
      user: req.session.user,
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === 'true';

  Home.findById(homeId).then(home => {
    if (!home) {
      console.log("Home not found for editing.");
      return res.redirect("/host/host-home-list");
    }

    console.log(homeId, editing, home);
    res.render("host/edit-home", {
      home: home,
      pageTitle: "Edit your Home",
      currentPage: "host-homes",
      editing: editing,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHostHomes = (req, res, next) => {
  Home.find().then(registeredHomes => {
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    })
  });
};

exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating, description } = req.body;
  const photo = '/uploads/' + req.file.filename;
  const home = new Home({houseName, price, location, rating,photo, description});
  home.save().then(() => {
    console.log('Home Saved successfully');
  });

  res.redirect("/host/host-home-list");
};

exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } = req.body;
  Home.findById(id).then((home) => {
    home.houseName=houseName;
    home.price=price;
    home.location=location;
    home.rating=rating;
    home.description=description;
    if(req.file) {
      fs.unlink(home.photo, (err) => {
        if (err) {
          console.log('Error while deleting old photo', err);
        } 
      })
      home.photo = '/uploads/' + req.file.filename;
    }

    home.save().then(result => {
      console.log('Home updated ', result);
    }).catch(err=>{
        console.log('Error while updating',err)
    })
}).then(() => {
  res.redirect("/host/host-home-list");
}).catch(err => {
  console.log('Error while finding or updating home', err);
});
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log('Came to delete ', homeId);
  Home.findByIdAndDelete(homeId).then(() => {
    res.redirect("/host/host-home-list");
  }).catch(error => {
    console.log('Error while deleting ', error);
  })
};