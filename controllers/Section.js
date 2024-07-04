const Section = require("../models/section");
const Course = require("../models/course");
const section = require("../models/section");

exports.createSection = async (req, res) => {
  try {
    //fetch data
    const { sectionName, courseId } = req.body;
    //data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        mssg: "All fields are required to create a new section.",
      });
    }
    //entry in db for the section
    const newSection = await Section.create({ sectionName });
    //update course with section
    const updatedCourse = await Course.findByIdAndUpdate(
      { courseId },
      { $push: { courseContent: newSection._id } },
      { new: true }
    );
    //how to use populate to replace ids of sections and subsections in the courseDetails

    //return response
    return res.status(200).json({
      success: true,
      mssg: "Section created successfully.",
      newSection,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      mssg: "Failed to create section, please try again.",
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    //fetch data
    const { sectionName, sectionId } = req.body;
    //data validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        mssg: "All fields are required to update a section.",
      });
    }
    //update the section db
    const updatedSection = await Section.findByIdAndUpdate(
      { sectionId },
      { sectionName: sectionName },
      { new: true }
    );
    //return response
    return res.status(200).json({
      success: true,
      mssg: "Section updated successfully.",
      updatedSection,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      mssg: "Failed to update section, please try again.",
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const {sectionId}=req.params;
    await Section.findByIdAndDelete(sectionId);
    // todo: do we need to delete this section from course schema also or will it get autodeleted
    return res.status(404).json({
        success:false,
        mssg:"section deleted successfully"
    })
  } 
  catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      mssg: "Failed to delete section, please try again.",
    });
  }
};
