if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
//console.log(process.env.CLOUD_NAME);
const express = require('express');
const app = express();
const mongoose = require("mongoose");
//const Listing = require("./models/listing.js");
//const Review = require("./models/reviews.js");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
//const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
//const { listingSchema, reviewSchema } = require("./schema.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
//const MongoStore = require("connect-mongo");
app.engine("ejs", ejsMate);
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
//const Mongo_url = 'mongodb://127.0.0.1:27017/Wanderlust';
const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}
main().then(() => {
    console.log("Connected to database");
})
    .catch((err) => {
        console.log(err);
    });


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE",err)
});
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

//demo user:
app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email: "arty@gmail.com",
        username: "abcd_1564",
    });
    let registeredUser = await User.register(fakeUser, "hello5467");
    res.send(registeredUser);
});

// app.get("/", (req, res) => {
//     res.send("I am Home Route");
// });


// app.get("/sampleListing", async (req, res) => {
//     let sample_listing = new Listing({
//         title: "My New Villa",
//         description: "Nearby the beach",
//         price: 1200,
//         location: " Calungate Goa",
//         country: "India"
//     });
//     await sample_listing.save();
//     console.log("sample was saved");
//     res.send("Successful testing");
// });

// const validateListing = (req, res, next) => {
//     let { error } = listingSchema.validate(req.body);
//     if (error) {
//         let errmsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(404, errmsg);
//     }
//     else {
//         next();
//     }
// }


// const validateReview = (req, res, next) => {
//     let { error } = reviewSchema.validate(req.body);
//     if (error) {
//         let errmsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(404, errmsg);
//     }
//     else {
//         next();
//     }
// }

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// // Review 

// //Post Rout
// app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);
//     listing.reviews.push(newReview);
//     //console.log(listing)
//     await newReview.save();
//     await listing.save();
//     console.log("New Review Saved");
//     //res.send("New Review Saved");
//     res.redirect(`/listings/${listing._id}`);
// }));
// // Delete Review Rout
// app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
//     let { id, reviewId } = req.params;
//     await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/listings/${id}`);
// }));

//Error handling
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!!"));
});
app.use((err, req, res, next) => {
    // res.send("Something Went Wrong");
    let { statusCode = 500, message = "Something went wrong!!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});
//app.get("/listings")

app.listen(8080, () => { console.log("Server is listening to port 8080") });