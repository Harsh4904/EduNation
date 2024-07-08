const { instance } = require("../config/razorpay");
const Course = require("../models/course");
const User = require("../models/user");
const { mailSender } = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mails/templates/courseEnrollmentEmail");

// capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
  //get course id and user id
  const { courseId } = req.body;
  const { userId } = req.user.id;

  //validation
  if (!courseId) {
    return res.json({
      success: false,
      mssg: "Enter valid course id.",
    });
  }
  let course;
  try {
    //validate course details
    course = await Course.findById(courseId);
    if (!course) {
      return res.status(403).json({
        success: false,
        mssg: "Could not verify the course.",
      });
    }
    const uid = new mongoose.Types.ObjectId(userId); //user id (string)--convert--> objectId
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(403).json({
        success: false,
        mssg: "User already enrolled in the course.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      mssg: error.message,
    });
  }

  //order create
  const options = {
    amount: course.price * 100,
    currency: "INR",
    notes: {
      courseId: courseId,
      userId,
    },
  };
  try {
    // initiate the payment using razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    //return res
    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescr: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    return res.status(501).json({
      success: false,
      mssg: "Could not create order.",
    });
  }
};

//verify the payment
exports.verifySignature = async (req, res) => {
  const webhookSecret = "12345678";
  const signature = req.headers["x-razorpay-signature"];
  const shashum = crypto.createHmac("sha256", webhookSecret);
  shashum.update(JSON.stringify(req.body));
  const digest = shashum.digest("hex");

  if (signature === digest) {
    console.log("Payment is authorized.");

    const { courseId, userId } = req.body.payment.payload.entity.notes;
    try {
      const enrolledCourse = await Course.findByIdAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );
      if (!enrolledCourse) {
        return res.status(404).json({
          success: false,
          mssg: "Course not found.",
        });
      }
      console.log(enrolledCourse);

      const enrolledStudent = await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true }
      );

      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Enrolled into new course!!",
        "Hey!! you enrolled into new course."
      );

      console.log(emailResponse);

      return res.status(200).json({
        success:true,
        mssg:"Signature verified and course added."
      })
    } catch (error) {
        return res.status(404).json({
            success:false,
            mssg:error.message
        })
    }
  }
  else {
    return res.status(500).json({
        success:false,
        mssg:"Payment not verified"
    })
  }
};
