const Section =require("../models/section");
const SubSection=require("../models/subsection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//creteSubSection
exports.createSubSection= async(req,res)=> {
    try {
        //fetch
        const {title,timeDuration,description,sectionId}=req.body;
        //extract video from the req files
        const video=req.files.videoFile;
        //validation
        if(!title || !timeDuration || !description || !sectionId) {
            return res.status(404).json({
                success:false,
                mssg:"All fields are required to create a sub-section."
            })
        }
        //upload video to cloudinary
        const videoDetails=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        //create sub-section entry in db
        const newSubSection=await SubSection.create({
            title,
            description,
            timeDuration,
            videoUrl:videoDetails.secure_url,
        });
        //add this subsection to the corresponding section
        const updatedSection=await Section.findByIdAndUpdate(
            {sectionId},
            { $push: {subSection:newSubSection._id}},
            {new:true},
        );
        // todo: log updated section here after adding populate

        //return res
        return res.status(200).json({
            success:true,
            mssg:"New sub-section created successfully."
        })

    }
    catch(error) {

    } 
}

//updateSubSection

//deleteSubSection