var express = require('express');
var router = express.Router();
const userModel = require("./users")
const passport = require("passport");
//this line allow user to create account on the basise of username and passeord
const localStrategy = require("passport-local");
const upload = require('./multer')
//user login for all the pages
passport.use(new localStrategy(userModel.authenticate()))

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/feed',isLoggedIn, function(req, res) {
  res.render('feed', {footer: true});
});

router.get('/profile',isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render('profile', {footer: true, user});
});

router.get('/search',isLoggedIn, function(req, res) {
  res.render('search', {footer: true});
});

router.get('/edit',isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render('edit', {footer: true, user});
});

router.get('/upload',isLoggedIn, function(req, res) {
  res.render('upload', {footer: true});
});

router.post("/ ", function(req, res ,next){
const userData = new userModel({
  username: req.body.username,
  name: req.body.name,
  email: req.body.email,
})

userModel.register(userData, req.body.password)
.then(function(){
 passport.authenticate("local")(req, res ,function(){
  res.redirect("/profile");
 })
})
});

router.post('/login',passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login"
}) , function(req, res) {
});

router.get('/logout', function(req, res ,next) {
  req.logout(function(err) {
    if (err) { return next(err);}
    res.redirect('/');
  });
});

router.post('/update',upload.single('image'), async function(req, res){
//  const user = await userModel.findOne({username: req.session.passport.user})
// const user = await userModel.findOneAndUpdate({unique, data_you_wanttoupdate,{new: true} })
const user = await userModel.findOneAndUpdate({username: req.session.passport.user},
  {username: req.body.username, name: req.body.name, bio: req.body.bio},
  {new: true}
  );
  if(req.file){
    user.profileImage = req.file.filename;
  }
 await user.save();
 res.redirect("/profile");
})

function isLoggedIn(req ,res, next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login")
}


module.exports = router;
