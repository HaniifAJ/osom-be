const userRepository = require('../repository/userRepository')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { TERCES } = require('../config') 

const registerUser = async (payload) => {
    try {
        const hashedPassword = await bcrypt.hash(payload.password, 10)
        const result = await userRepository.registerUser({...payload, password: hashedPassword})
        console.log('controller:', result)
        return result
    } catch (error) {
        console.error('scope: userController, registerUser:', error)
        throw error
    }
}

const loginUser = async (payload) => {
    try {
        const checkUser = await userRepository.getUserByEmail(payload.email)
        const checkPassword = await bcrypt.compare(payload.password, checkUser.password)
        if(!checkPassword){
            throw new Error('Email or password is invalid')
        }
        const token = jwt.sign({userId: checkUser.id, userData: checkUser}, TERCES, {
            expiresIn: '1h'
        })
        return token
    } catch (error) {
        throw error
    }
}


module.exports = {
    registerUser,
    loginUser,
}