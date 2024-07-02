const jwt = require("jsonwebtoken");
require("dotenv").config();

// auth for token verificaiton
exports.auth = async (req, res, next) => {
  try {
    //extract the token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorisation").replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        mssg: "Token is missing",
      });
    }

    //verify the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
    } 
    catch (error) {
      console.log(error);
      return res.status(404).json({
        success: false,
        mssg: "Invalid token",
      });
    }
    next();
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      mssg: "Something went wrong",
    });
  }
};

// isStudent
exports.isStudent = async (req, res, next) => {
    try{
        if(req.user.accountType!=="Student") {
            return res.status(401).json({
                success:false,
                mssg:"This route is for students only."
            })
        }
        next();
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            mssg:"User cannot be verified, please try again."
        })
    }
};

//isInstructor
exports.isInstructor = async (req, res, next) => {
    try{
        if(req.user.accountType!=="Instructor") {
            return res.status(401).json({
                success:false,
                mssg:"This route is for instructors only."
            })
        }
        next();
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            mssg:"User cannot be verified, please try again."
        })
    }
};

//isAdmin
exports.isAdmin = async (req, res, next) => {
    try{
        if(req.user.accountType!=="Admin") {
            return res.status(401).json({
                success:false,
                mssg:"This route is for admin only."
            })
        }
        next();
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            mssg:"User cannot be verified, please try again."
        })
    }
};
