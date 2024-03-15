const route = require('express').Router()

const {
    trainerCreatePost, addTrainerPostComments, addLikeToTrainerPost,
    getTrainierPostComments, getpostTrainerPost, getpostTrainercreatePostById

} = require('../controllers/trainercreatepostctrl')
const { jwtverify } = require('../middleware/jwtverify')

const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })

route.post('/trainerCreatePost', jwtverify, upload.single('postImg'), trainerCreatePost)
route.put('/addTrainerPostComments/:postId',jwtverify,addTrainerPostComments)
route.put('/addLikeToTrainerPost/:postId', jwtverify, addLikeToTrainerPost)
route.get('/getTrainierPostComments', getTrainierPostComments)
route.get('/getpostTrainingRequirement', getpostTrainerPost)
route.get('/getpostTrainercreatePostById/:postId', getpostTrainercreatePostById)




module.exports = route;
