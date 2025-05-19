// External Module
const express = require("express");
const storeRouter = express.Router();

// Local Module
const storeController = require("../controllers/storeController");

// Home page
storeRouter.get("/", storeController.getIndex);

// Homes listing page
storeRouter.get("/homes", storeController.getHomes);

// Booking form page for a specific home
storeRouter.get("/homes/:homeId/book", storeController.getBookHome);

// Home details page
storeRouter.get("/homes/:homeId", storeController.getHomeDetails);

// My bookings static page
storeRouter.get("/bookings", storeController.getBookings);

// View user's booked homes
storeRouter.get("/book/:homeId", storeController.getBooked);

// Submit booking form
storeRouter.post("/store/book", storeController.postBookHome);

// Cancel booking
storeRouter.post("/bookings/cancel/:homeId", storeController.postCancelBooking);

// View favourite homes
storeRouter.get("/favourites", storeController.getFavouriteList);

// Add a home to favourites
storeRouter.post("/favourites", storeController.postAddToFavourite);

// Remove a home from favourites
storeRouter.post("/favourites/delete/:homeId", storeController.postRemoveFromFavourite);

module.exports = storeRouter;
