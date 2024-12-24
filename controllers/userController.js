const userRepository = require('../repository/userRepository')

const updateAvatar = async (user_id, avatar_id) => {
    try {
        const result = await userRepository.updateAvatar(user_id, avatar_id)
        console.log('controller:', result)
        const response = {
            userId: result.userId,
            fullname: result.fullname,
            avatar_id: result.avatar_id,
        }
        return response
    } catch (error) {
        console.error('scope: userController, updateAvatar:', error)
        throw error
    }
}

const getMyData = async (userId) => {
    try {
        const result = await userRepository.getUserById(userId)
        console.log('controller:', result)
        const response = {
            userId: result.id,
            email: result.email,
            fullname: result.fullname,
            avatar_id: result.avatar_id,
            total_matches: result.total_matches,
            highscore: result.highscore,
            batu: result.batu,
            gunting: result.gunting,
            kertas: result.kertas
        }
        return response
    } catch (error) {
        console.error('scope: userController, getMyData:', error)
        throw error
    }
}

const getLeaderboard = async (userId) => {
    try {
        let topscorer = []
        topscorer = await userRepository.getLeaderboard()
        console.log(topscorer.length)
        const userRank = await userRepository.getUserRank(userId)
        let userData
        if(userRank <= 1000){
            if(topscorer[userRank-1].id != userId) {
                console.log('actualy still need sort')
                topscorer.sort((a, b) => a.rank - b.rank)
            }
            userData = topscorer[userRank-1]
        } else {
            const checkUser = await userRepository.getUserById(userId)
            userData = {
                id: checkUser.id,
                fullname: checkUser.fullname,
                highscore: checkUser.highscore,
                rank: userRank
            }
        }
        return {
            leaderboard: topscorer,
            userData: userData
        }
    } catch (error) {
        console.error('scope: userController, getLeaderboard:', error)
        throw error
    }
}

const getPublicData = async (userId) => {
    try {
        const result = await userRepository.getUserById(userId)
        console.log('controller:', result)
        const response = {
            userId: result.id,
            fullname: result.fullname,
            avatar_id: result.avatar_id,
            total_matches: result.total_matches,
            highscore: result.highscore,
            batu: result.batu,
            gunting: result.gunting,
            kertas: result.kertas
        }
        return response
    } catch (error) {
        console.error('scope: userController, getPublicData:', error)
        throw error
    }
}

module.exports = {
    updateAvatar,
    getMyData,
    getLeaderboard,
    getPublicData
}