const db = require('./postgresql')

const getMatchById = async (id) => {
    try {
        const result = await db.getDataByParam('matches', {id: id})
        return result[0]
    } catch (error) {
        console.error('scope: matchRepository, getMatchById:', error)
    }
}

const getMatchByMode = async (mode) => {
    try {
        const result = await db.getDataByParam('matches', {mode: mode})
        return result[0]
    } catch (error) {
        console.error('scope: matchRepository, getMatchByMode', error)
    }
}


const registerMatch = async (payload) => {
    try {
        const result = await db.insertRow('matches', payload)
        console.log(result)
        return result
    } catch (error) {
        console.error('scope: matchRepository, registerMatch:', error)
        throw error
    }
}

module.exports = {
    getMatchById,
    getMatchByMode,
    registerMatch
}