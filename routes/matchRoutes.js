const express = require("express");
const router = express.Router();
const validator = require('../validators/index')
const matchController = require('../controllers/matchController')
const authMiddleware = require('../middlewares/auth')

router.post('/', authMiddleware, async (req, res) => {
    const userId = req.user.userId
    const { body } = req
    const { value, error } =  validator.match.createMatch.validate(body)
    if(error) {
        res.status(400).send(error)
        return
    }
    try {
        const data = await matchController.startMatch(userId, value);
        console.log('data', data)
        res.status(201).send({message: 'match started', data: data})
    } catch (error) {
        console.error('error start match route:', error)
        res.status(500).send(error.message)
    }
})

router.put('/', authMiddleware, async (req, res) => {
    const userId = req.user.userId
    console.log(userId)
    const { body } = req
    const { value, error } =  validator.match.updateMatch.validate(body)
    if(error) {
        res.status(400).send(error)
        return
    }
    try {
        const data = await matchController.updateMatch(userId, value);
        console.log('data', data)
        res.status(201).send(data)
    } catch (error) {
        console.error('error update match route:', error)
        res.status(500).send(error.message)
    }
})

router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.userId
    try {
        const data = await matchController.getMatch(userId);
        console.log('data', data)
        res.status(201).send({message: 'match found', data: data})
    } catch (error) {
        console.error('error get match route:', error)
        res.status(500).send(error.message)
    }
})

module.exports = router