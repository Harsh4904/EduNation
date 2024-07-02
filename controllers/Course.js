const Course = require("../models/course");
const Tag = require("../models/tag");
const User = require("../models/user");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createCourse = async (req, res) => {
  try {
    //
  } 
  catch (error) {
    console.log(error);
    return res.status(501).json({
      success: false,
      mssg: "Error occured while creating course, please try again.",
    });
  }
};
