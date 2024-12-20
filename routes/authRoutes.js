const express = require("express");
const router = express.Router();
const validator = require('../validators/index')
const userController = require('../controllers/userController')

router.post('/register', async (req, res) => {
    const { body } = req
    const { value, error } =  validator.user.createUserSchema.validate(body)
    if(error) {
        res.status(400).send(error)
        return
    }
    try {
        const data = await userController.registerUser(value);
        console.log('data', data)
        res.status(201).send({message: 'user registered', data: data})
    } catch (error) {
        console.error('error register route:', error)
        res.status(400).send(error.message)
    }
})

router.post('/login', async (req, res) => {
    const { body } = req
    const { value, error } =  validator.user.loginSchema.validate(body)
    if(error) {
        res.status(400).send(error)
        return
    }
    try {
        const data = await userController.loginUser(value);
        console.log('data', data)
        res.status(201).send({message: 'login successful', token: data})
    } catch (error) {
        console.log('error register route:', error)
        res.status(400).send(error.message)
    }
})



module.exports = router