const express = require("express");
const router = express.Router();
const validator = require('../validators/index')
const userController = require('../controllers/userController');
const {authMiddleware} = require("../middlewares/auth");

router.get('/', authMiddleware, async (req, res) => {
    const { user } = req
    try {
        const result = await userController.getMyData(user.userId)
        console.log(result)
        res.send({
            message: 'get user data success',
            data: result
        })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.put('/', authMiddleware, async (req, res) => {
    const userId = req.user.userId
    const { body } = req
    const {value, error} = validator.user.updateAvatarSchema.validate(body)
    if(error) {
        res.status(400).send(error)
        return
    }
    try {
        const result = await userController.updateAvatar(userId, value.avatar_id)
        console.log(result)
        res.send({
            message: 'update avatar success',
            data: result
        })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/leaderboard', authMiddleware, async (req, res) => {
    const userId = req.user.userId
    try {
        const result = await userController.getLeaderboard(userId)
        console.log('leaderboard')
        res.send({
            message: 'get leaderboard success',
            data: result
        })
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router