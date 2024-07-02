const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    
    courseName: {
        type: String,
    },
    courseDescription: {
        type: String,
    },
    instructor : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    whatWillYouLearn : {
        type: String,
    }, 
    courseContent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
        required: true
    }],
    ratingAndReview: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReview",
        required: true
    }],
    price : {
        type: Number,
    },
    thumbnail : {
        type: String
    },
    tag : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
        required: true
    }, 
    studentsEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }]

});

module.exports= mongoose.model("Course",courseSchema);
