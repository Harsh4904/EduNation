const Tag=require("../models/tag");

exports.createTag= async(req,res)=> {
    try{
        const {name,description}=req.body;
        if(!name || !description) {
            return res.status(404).json({
                success:false,
                mssg:"All fields are required"
            })
        }
        // create an entry in DB
        const tagDetails=await Tag.create({
            name,
            description
        });
        console.log(tagDetails);
        //return response
        return res.status(200).json({
            success:true,
            mssg:"Tag created successfully"
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            mssg:"Tag not created, try again."
        })
    }
}

exports.showAllTags= async(req,res)=> {
    try{
        const allTags= await Tag.find({}, {name:true, description:true});
        return res.status(200).json({
            success:true,
            allTags
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            mssg:"Some error occured while getting tags, try again."
        })
    }
}