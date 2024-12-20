const userRepository = require('../repository/userRepository')

const updateAvatar = async (user_id, avatar_id) => {
    try {
        const result = await userRepository.updateAvatar(user_id, avatar_id)
        console.log('controller:', result)
        return result
    } catch (error) {
        console.error('scope: userController, updateAvatar:', error)
        throw error
    }
}

const getMyData = async (userId) => {
    try {
        const result = await userRepository.getUserById(userId)
        console.log('controller:', result)
        return result
    } catch (error) {
        console.error('scope: userController, getMyData:', error)
        throw error
    }
}

module.exports = {
    updateAvatar,
    getMyData
}