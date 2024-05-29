const Listing = require("../models/listing");
const Review = require("../models/reviews")
module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    //console.log(listing)
    await newReview.save();
    await listing.save();
    req.flash("success", "New review added!!!");
    console.log("New Review Saved");
    //res.send("New Review Saved");
    res.redirect(`/listings/${listing._id}`);
};
module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!!");
    res.redirect(`/listings/${id}`);
};
