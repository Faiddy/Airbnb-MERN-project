const express = require("express");
const storeRouter = express.Router();

const storeController = require("../controllers/storeController");

// Home page
storeRouter.get("/", storeController.getIndex);

// Homes listing page
storeRouter.get("/homes", storeController.getHomes);

// Home details page
storeRouter.get("/homes/:homeId", storeController.getHomeDetails);

// Booking form page for a specific home
storeRouter.get("/homes/:homeId/book", storeController.getBookHome);

// List all bookings for the current user
storeRouter.get("/bookings", storeController.getBookings);

// Submit booking form
storeRouter.post("/store/book", storeController.postBookHome);

// Cancel booking
storeRouter.post("/bookings/cancel/:bookingId", storeController.postCancelBooking);
//check availability
storeRouter.get('/check-availability', storeController.checkAvailability);


// Favourite homes list
storeRouter.get("/favourites", storeController.getFavouriteList);

// Add a home to favourites
storeRouter.post("/favourites", storeController.postAddToFavourite);

// Remove a home from favourites
storeRouter.post("/favourites/delete/:homeId", storeController.postRemoveFromFavourite);

module.exports = storeRouter;
