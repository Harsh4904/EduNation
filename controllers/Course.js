const Course = require("../models/course");
const Tag = require("../models/tag");
const User = require("../models/user");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

exports.createCourse = async (req, res) => {
  try {
    //fetch data
    const { courseName, courseDescription, whatYouWillLearn, price, tag } = req.body;
    const { thumbnail } = req.files;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag
    ) {
      return res.status(404).json({
        success: false,
        mssg: "All fields are necessary",
      });
    }

    //check for instructor
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        mssg: "Instructor details not found.",
      });
    }

    //check given tag is valid or not
    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        mssg: "Tag details not found.",
      });
    }

    //upload thumbnail to cloudinary
    const thumnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //create an entry in db for the new course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatWillYouLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumnailImage.secure_url,
    });

    //add the new course to the schema of the instructor
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    //update the tag schema
    await Tag.findByIdAndUpdate(
      { _id: tagDetails._id },
      { $push: { course: newCourse._id } },
      { new: true }
    );
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      success: false,
      mssg: "Error occured while creating course, please try again.",
    });
  }
};

exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReview: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      mssg: "Courses data fetched successfully.",
      data: allCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      mssg: "Cannot get all courses, please try again.",
      error,
    });
  }
};
