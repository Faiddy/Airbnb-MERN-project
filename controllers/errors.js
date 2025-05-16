exports.pageNotFound = (req,res,next) => {
  res.render('404',{pageTitle:'Page not found',currentPage: "404",
  isLoggedIn: req.isLoggedIn,
  user: req.session.user,
  });
}