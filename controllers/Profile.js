const User = require("../models/user");
const Profile = require("../models/profile");

exports.updateProfile = async (req, res) => {
  try {
    //fetch data
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
    //get userId from req
    const userId = req.user.id;
    //validation
    if (!contactNumber || !gender || !userId) {
      return res.status(404).json({
        success: false,
        mssg: "Please fill the required fileds to update the profile.",
      });
    }
    //find the profile
    const userDetails = await User.findById({ userId });
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);
    //update the profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();
    //return res
    return res.status(200).json({
      success: true,
      mssg: "Profile updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      mssg: "Profile not updated, try again.",
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    //get Id
    const { userId } = req.body;
    //validation
    const userDetails = User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        mssg: "User not found.",
      });
    }
    //delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    // todo: reduce the students enrolled number in every course for this student who deleted the account

    //delete user
    await User.findByIdAndDelete({ _id: userId });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      mssg: "Account not deleted, try again.",
    });
  }
};
