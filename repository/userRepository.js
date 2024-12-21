const db = require('./postgresql')

const getUserById = async (id) => {
    try {
        const result = await db.getDataByParam('users', {id: id})
        if(result.length == 0) {
            throw new Error('User not found')
        }
        return result[0]
    } catch (error) {
        console.error('scope: userRepository, getUserById:', error)
        throw error
    }
}

const getUserRank = async (userId) => {
    try {
        const queryString = `SELECT COUNT(*) + 1 AS rank
                        FROM users
                        WHERE highscore > (SELECT highscore FROM users WHERE id = ${userId});`
        const result = await db.query(queryString)
        if(result.length == 0) {
            throw new Error('User not found')
        }
        return result[0]
    } catch (error) {
        console.error('scope: userRepository, getUserRank:', error)
        throw error
    }
}

const getLeaderboard = async () => {
    try {
        const queryString = `SELECT 
                                id, 
                                fullname, 
                                highscore, 
                                ROW_NUMBER () OVER (
                                    ORDER BY
                                        highscore
                                    DESC
                                    ) as rank
                                FROM (
                                    SELECT * FROM users WHERE highscore > 0
                                    ) as activeUser
                                ORDER BY highscore DESC
                                LIMIT 1000;`
        const result = await db.query(queryString)
        if(result.length == 0) {
            throw new Error('User not found')
        }
        return result
    } catch (error) {
        console.error('scope: userRepository, getUserRank:', error)
        throw error
    }
}

const getUserByEmail = async (email) => {
    try {
        const result = await db.getDataByParam('users', {email: email})
        console.log('result', result)
        if(result.length == 0) {
            throw new Error('User not found')
        }
        return result[0]
    } catch (error) {
        console.error('scope: userRepository, getUserByEmail:', error)
        throw error
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

const updateAvatar = async (user_id, avatarId) => {
    try {
        const result = await db.updateRow('users', user_id, {avatar_id: avatarId})
        console.log(result)
        return result
    } catch (error) {
        console.error('scope: userRepository, registerUser:', error)
        throw error
    }
}

const updateHighscoreMatch = async (userId, newHighScore, totalMatch) => {
    try {
        console.log('upd', userId, newHighScore, totalMatch)
        const result = await db.updateRow('users', userId, {highscore: newHighScore, total_matches: totalMatch + 1})
        console.log(result)
        return result
    } catch (error) {
        console.error('scope: userRepository, registerUser:', error)
        throw error
    }
}

const updateTotalMatch = async (userId, totalMatch) => {
    try {
        console.log('upd', userId, totalMatch)
        const result = await db.updateRow('users', userId, {total_matches: totalMatch + 1})
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
    getUserRank,
    getLeaderboard,
    registerUser,
    updateAvatar,
    updateHighscoreMatch,
    updateTotalMatch
}