const Otp = require("../models/otp");
const User = require("../models/user");
const Profile = require("../models/profile");
const otpGenerator = require("otp-generator");
const bycrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
require("dotenv").config();

// sendOtp
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // check if user exists already
    const userPresent = await User.findOne({ email });
    if (userPresent) {
      return res.status(401).json({
        mssg: "User already exists",
        success: false,
      });
    }

    // genereateOtp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    // otp should be unique
    const result = await Otp.findOne({ otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await Otp.findOne({ otp });
    }
    console.log("Otp generated :", otp);

    // create an entry in otp db
    const otpPayload = { email, otp };
    const otpBody = await Otp.create(otpPayload);
    console.log(otpBody);

    return res.status(400).json({
      success: true,
      mssg: "Otp created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json(404).json({
      success: false,
      mssg: "Some error occured while generating otp",
    });
  }
};

// signup
exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;
    //validate this data
    if (!firstName || !lastName || !email || !password || !otp) {
      return res.status(404).json({
        success: false,
        mssg: "All fields are required",
      });
    }

    // Match passwords
    if (password != confirmPassword) {
      return res.status(404).json({
        success: false,
        mssg: "Passwords do not match",
      });
    }

    // Check if user exists already
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(404).json({
        success: false,
        mssg: "User already exists",
      });
    }

    // find most recent otp
    const recentOtp = await Otp.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    // validate otp
    if (recentOtp.length == 0) {
      return res.status(404).json({
        success: false,
        mssg: "Otp not found",
      });
    }
    //match the otps
    else if (recentOtp != otp) {
      return res.status(404).json({
        success: false,
        mssg: "Invalid OTP",
      });
    }

    // Hash password before creating entry in db
    const hashedPass = await bycrypt.hash(password, 10);

    // Create entry in DB

    // create a null profile db first
    const profileDetails = await Profile.create({
      gender: null,
      dob: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPass,
      accountType,
      contactNumber,
      additionalDetails: profileDetails._id,
      image: `https://ui-avatars.com/api/?name=${firstName} ${lastName}`,
    });

    return res.status(200).json({
      success: true,
      mssg: "User created successfully",
    });
  } catch (error) {
    console.log("Error occured while creating user: ", error);
    return res.status(404).json({
      success: false,
      mssg: "Some error occurred while creating user",
    });
  }
};

// login
exports.login = async (req, res) => {
  try {
    // get data from user body
    const { email, password } = req.body;

    // validation of data
    if (!email || !password) {
      return res.status(404).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // check user exist or not
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist.",
      });
    }

    // generate JWT after matching password
    if (await bycrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        accountType: user.accountType,
        id: user._id,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      // create cookie and send response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        user,
        token,
        mssg: "Logged in successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        mssg: "Wrong password",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      msgg: "Login failed, please try again",
    });
  }
};

// changePassword
exports.changePassword = async (req, res) => {
  try {
    // get data from user
    // get old pass, new pass, confirm new pass from user
    const { email, oldPass, newPass, confirmNewPass } = req.body;

    // validation
    if (!oldPass || !newPass || !confirmNewPass) {
      return res.status(404).json({
        success: false,
        mssg: "Enter all details",
      });
    }

    const user = await User.fineOne({ email });
    if (!user) {
      return res.status(404).json({
        mssg: "User does not exist",
      });
    }

    if (confirmNewPass != newPass) {
      return res.status(500).json({
        mssg: "Both passwords should match",
      });
    }

    if (await bycrypt.compare(oldPass, user.password)) {
      // update pass in new DB
      await User.updateOne({ email }, { $set: { password: newPass } });

      // send mail -- pasword update
      const mailResponse = await mailSender(
        user.email,
        "Password change",
        "Your password has been changed"
      );

      // return response
      return res.status(200).json({
        success: true,
        mssg: "Password has been changed",
        mailResponse,
      });
    } else {
      return res.status(404).json({
        success: false,
        mssg: "Enter correct password",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      mssg: "Password not changed, please try again",
    });
  }
};
