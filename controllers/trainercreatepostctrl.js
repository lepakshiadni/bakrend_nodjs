const aws = require('aws-sdk')
require('dotenv').config()
const trainerCreatePostSchema = require('../models/trainerCreatePostmodel')

aws.config.update({
    accessKeyId: process.env.S3_ACCESSKEY_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_BUCKET_REGION,

})
const s3 = new aws.S3();

const trainerCreatePost = async (req, resp) => {
    const { _id } = req.user

    try {
        let postImgUrl;
        if (req.file) {
            const postImg = req.file
            const params = {
                Bucket: 'sisso-data',
                Key: `trainerPost/${_id}/${postImg.originalname}`,
                Body: postImg.buffer,
                ContentType: postImg.mimetype
            };
            const data = await s3.upload(params).promise();
            // console.log("Image uploaded successfully at ", data.Location);
            postImgUrl = data.Location;
            const postedImg = {
                fileName: postImg.originalname,
                postImg: postImgUrl || ''
            }
            const createPost = new trainerCreatePostSchema({
                postedById: _id,
                postedByName: `${req.user?.basicInfo?.firstName} ${req.user?.basicInfo?.lastName}`,
                postedByDesignation: `${req.user?.basicInfo?.designation}`,
                postedByImg: req.user?.basicInfo?.profileImg || '',
                postForAllSissoMember: req.body.postForAllSissoMember || false,
                onlyPostMyConnenctions: req.body.onlyPostMyConnenctions || false,
                postedDescrition: req.body.postDescription,
                postedImg: postedImg
            })
            console.log(createPost)
            createPost.save()
            resp.status(201).json({ success: true, message: "Your Post has been created Successfully!", createPost });
        }
        else {
            resp.status(200).json({ success: false, message: 'Error in the Upload Image' })
        }
    }
    catch (error) {
        console.log('error', error)
        resp.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// find postRequiement and add comments
const addTrainerPostComments = async (req, resp) => {
    const { comment } = req.body
    const { postId } = req.params

    try {
        const findTrainerPost = await trainerCreatePostSchema.findById(postId);

        if (!findTrainerPost) {
            return resp.status(404).json({ success: false, message: " No Post Found" })
        }
        // console.log(findTrainingPost)
        findTrainerPost.comments.push(comment);
        await findTrainerPost.save();

        resp.status(201).json({ success: true, message: 'Comment Added', comments: findTrainerPost?.comments })
    }
    catch (error) {
        console.log(error)
        resp.status(500).json({ sucess: false, message: "Server Error" })
    }

}
// add like  on posts
const addLikeToTrainerPost = async (req, resp) => {
    const { likedBy } = req.body;
    const { postId } = req.params;

    console.log(postId, likedBy);

    try {
        const findTrainingPost = await trainerCreatePostSchema.findById(postId);

        if (!findTrainingPost) {
            return resp.status(404).json({ success: false, message: "No Post Found" });
        }

        // Check if likedBy already exists in the likes array
        const existingLikeIndex = findTrainingPost.likes.findIndex(like => like._id.toString() === likedBy);

        if (existingLikeIndex === -1) {
            // Add like if it doesn't exist
            findTrainingPost.likes.push({ _id: likedBy }); // Assuming likedBy is an ObjectId
            await findTrainingPost.save();
            resp.status(201).json({ success: true, message: 'Like Added', postTrainingDetails: findTrainingPost });
        } else {
            // Remove like if it already exists
            findTrainingPost.likes.splice(existingLikeIndex, 1);
            await findTrainingPost.save();
            resp.status(201).json({ success: true, message: 'Like Removed', postTrainingDetails: findTrainingPost });
        }
    } catch (error) {
        console.log(error);
        resp.status(500).json({ success: false, message: "Server Error" });
    }
};

// get the post training comments 

const getTrainierPostComments = async (req, res) => {
    const { postId } = req.params
    const findTrainerPostComments = await trainerCreatePostSchema.findOne({ _id: postId })

    try {
        if (!findTrainerPostComments) {
            return res.status(404).json({ success: false, msg: "No Comments found" });
        }
        else {
            await findTrainerPostComments.comments.sort((a, b) => b.createdAt - a.createdAt);
            res.status(200).json({ success: true, message: 'Getting all comments', comments: findTrainerPostComments.comments });
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "server error" });
    }

}

const getpostTrainercreatePostById = async (req, resp) => {
    const { postId } = req.params
    try {
        const trainercreatePost = await trainerCreatePostSchema.findById(postId)
        if (!trainercreatePost) {
            resp.status(404).json({ success: false, message: "No Post Found" })
        }
        else {
            resp.status(200).json({ success: true, message: 'Post Fected', trainercreatePost })
        }
    }
    catch (error) {
        resp.status(500).json({ success: false, message: 'Server Error' });
    }
}

const getpostTrainerPost = async (req, resp) => {
    try {
        const trainercreatePost = await trainerCreatePostSchema.find().sort({ createdAt: -1 });
        if (trainercreatePost.length == 0) {
            resp.status(200).json({ success: false, message: "No Post Found" })
        }
        else {
            resp.status(201).json({ success: true, message: 'Post Fected', trainercreatePost })
        }
    }
    catch (error) {
        resp.status(500).json({ success: false, message: 'Server Error' });
    }
}


module.exports = {
    trainerCreatePost, addTrainerPostComments, addLikeToTrainerPost,
    getTrainierPostComments, getTrainierPostComments, getpostTrainerPost,
    getpostTrainercreatePostById
}






















