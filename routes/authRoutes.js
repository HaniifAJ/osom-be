const express = require("express");
const router = express.Router();
const validator = require('../validators/index')
const authController = require('../controllers/authController')

router.post('/register', async (req, res) => {
    const { body } = req
    const { value, error } =  validator.user.createUserSchema.validate(body)
    if(error) {
        res.status(400).send(error)
        return
    }
    try {
        const data = await authController.registerUser(value);
        console.log('data', data)
        res.status(201).send({message: 'user registered', data: data})
    } catch (error) {
        console.error('error register route:', error)
        res.status(500).send(error.message)
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
        const data = await authController.loginUser(value);
        console.log('data', data)
        res.status(201).send({message: 'login successful', data: {token: data}})
    } catch (error) {
        console.log('error register route:', error)
        res.status(500).send(error.message)
    }
})



module.exports = router