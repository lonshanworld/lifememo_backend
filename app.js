const express = require('express');

const mongoose = require("mongoose");
// const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const cors = require("cors");
// const { ExpressPeerServer } = require("peer");

// const session = require("express-session");
// const userModel = require("./models/usermodel");
// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
const logger = require('morgan');
const limiter = require("./middleware/ratelimitmiddleware");
require("dotenv").config();

//for v1
const v1indexRouter = require('./api/v1/index');
const v1usersRouter = require("./api/v1/user");
const v1imageRouter = require("./api/v1/image");
const v1postRouter = require("./api/v1/moment");
const v1chatRouter = require("./api/v1/chat");
const v1packageRouter = require("./api/v1/package");
const v1purchaseRouter = require("./api/v1/purchase");

//for v2
const v2indexRouter = require("./api/v2/index");

const app = express();

async function main(){
    await mongoose.connect("mongodb+srv://lmfirstproject:lifememoryproject01@lifememorycluster.4muhltj.mongodb.net/?retryWrites=true&w=majority",{ 
        dbName: "LifeMEMOry_db",
        useUnifiedTopology: true, 
        useNewUrlParser: true,
     });
    console.log("mongodb start connected");
}
main().then(err => {
  // console.log(err);
});
app.set('trust proxy', 1)
app.set('case sensitive routing', true);
app.use(logger('dev'));
// passport.use(
//     new LocalStrategy(async(email, password, done) =>{
//         try{
//             const findUser = await userModel.findOne({email: email});
//             if(!findUser){
//                 return done(null, false, {message: "Incorrect email"});
//             };

//             if(findUser.password !== password){
//                 return done(null, false, {message: "Incorrect password"});
//             };

//             return done(null, findUser);
//         }catch(err){
//             return done(err);
//         }
//     })
// );
// app.use(passport.initialize());

const corsOptions = {
  // origin : "http:localhost:3000",
  origin: "*",
  methods: 'GET, POST, PUT, DELETE',
  // allowedHeaders: 'Content-Type',
  // credentials: true
};

// const peerServer = ExpressPeerServer(server, {
//   // debug: true,
//   path: "/",
// });
// app.get("/callserver/videocall", peerServer);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(limiter);

// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

const v1string = "/api/v1/";
const v2string = "/api/v2/";

//for v1
app.use(v1string, v1indexRouter);
app.use(v1string+"user", v1usersRouter);
app.use(v1string+"image", v1imageRouter);
app.use(v1string+"post", v1postRouter);
app.use(v1string+"chat",v1chatRouter);
app.use(v1string+"package", v1packageRouter);
app.use(v1string+"purchase",v1purchaseRouter );

//for v2
app.use(v2string, v2indexRouter);

module.exports = app;
