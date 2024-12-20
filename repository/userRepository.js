const db = require('./postgresql')

const getUserById = async (id) => {
    try {
        const result = await db.getDataByParam('users', {id: id})
        return result[0]
    } catch (error) {
        console.error('scope: userRepository, getUserById:', error)
    }
}

const getUserByEmail = async (email) => {
    try {
        const result = await db.getDataByParam('users', {email: email})
        return result[0]
    } catch (error) {
        console.error('scope: userRepository, getUserByEmail:', error)
    }
}

const registerUser = async (payload) => {
    try {
        const result = await db.insertRow('users', payload)
        console.log(result)
        return result
    } catch (error) {
        console.error('scope: userRepository, registerUser:', error)
        throw error
    }
}

module.exports = {
    getUserById,
    getUserByEmail,
    registerUser
}