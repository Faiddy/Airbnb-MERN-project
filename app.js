// Core Module
const path = require('path');

// External Module
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const DB_Path = "mongodb+srv://root:root@completecoding.t7urw5d.mongodb.net/airbnb?retryWrites=true&w=majority&appName=CompleteCoding";
const multer = require('multer');
//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const rootDir = require("./utils/pathUtil");
const authRouter = require("./routes/authRouter");
const errorsController = require("./controllers/errors");
const {default: mongoose} = require('mongoose')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new MongoDBStore({
  uri: DB_Path,
  collection: 'sessions'
});

const randomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
} 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + '-' + file.originalname)
  } 
})

const fileFilter = (req,file,cb) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null, true);
  }else{
    cb(null, false);
  }
}

const moulterOptions = {
  storage, fileFilter
}

app.use(express.urlencoded());
app.use(multer(moulterOptions).single('photo'));
app.use(express.static(path.join(rootDir, 'public')))
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/host/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/homes/uploads', express.static(path.join(rootDir, 'uploads')));



app.use(session({
secret:'airbnb',
resave:false,
saveUninitialized:true,
store:store,
}));

app.use((req,res,next)=>{
  req.isLoggedIn = req.session.isLoggedIn;
  next()
})

app.use(storeRouter);
app.use(authRouter);
app.use("/host", (req, res, next) => {
if (req.isLoggedIn) {
next();  
}else {
  res.redirect("/login")
}
});

app.use("/host", hostRouter);


app.use(errorsController.pageNotFound);

const PORT = 3000;


mongoose.connect(DB_Path).then(()=>{
  console.log('DB connected')
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}).catch(err=>{
  console.log('Error while connecting to MongoDB',err)
})