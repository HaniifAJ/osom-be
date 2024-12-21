const matches = new Map();
const matchRepository = require('../repository/matchRepository')
const userRepository = require('../repository/userRepository')

const startMatch = async (userId, payload) => {
    try {
        if(matches.has(userId)){
            throw new Error('Match already exists for this user.');
        }
        let match = {
            userId: userId,
            level: 1,
            health: 5,
            score: 0,
            winstreak: 0,
            mode: payload.mode
        }
        matches.set(userId, match)
        console.log('controller startMatch:', match)
        return match
    } catch (error) {
        console.error('scope: matchController, matchUser:', error)
        throw error
    }
}

const gameLogic = (playerMove, computerMove) => {
    if(playerMove == computerMove) return 0
    if(playerMove == 'batu' && computerMove == 'gunting') return 1
    if(playerMove == 'gunting' && computerMove == 'kertas') return 1
    if(playerMove == 'kertas' && computerMove == 'batu') return 1
    return -1
}

const updateMatch = async (userId, payload) => {
    try {
        if (!matches.has(userId)) {
            throw new Error('Match not found.')
        }

        const match = matches.get(userId)
        const moves = ['batu', 'gunting', 'kertas']
        const computerMove = moves[Math.floor(Math.random() * 3)]
        const checkWin = gameLogic(payload.move, computerMove)
        let multiplier = 1
        if(match.winstreak + 1 >= 3) multiplier = 2
        if(match.winstreak + 1 >= 5) multiplier = 3
        if(match.winstreak + 1 >= 10) multiplier = 5

        let dmgMultiplier = 1
        if(match.mode == 'hard' && match.level > 9) dmgMultiplier = 2
        if(match.mode == 'hard' && match.level > 29) dmgMultiplier = 3

        let addedHealth = 0

        if(checkWin < 0) {
            addedHealth = -1*dmgMultiplier
            match.health += addedHealth
            match.winstreak = 0

            if(match.health <= 0) {
                const newRow = {
                    user_id: match.userId,
                    level: match.level,
                    score: match.score,
                    mode: match.mode
                }
                const result = await matchRepository.registerMatch(newRow)
                const responseData = {
                    message: 'Match is over',
                    code: -2,
                    result: 'Lose',
                    player_move: payload.move,
                    computer_move: computerMove,
                    data: { ...match, addedHealth: addedHealth},
                    match_details: result
                }
                const checkUser = await userRepository.getUserById(userId)
                console.log(checkUser)
                if(checkUser.highscore < match.score) {
                    const doUpdate = await userRepository.updateHighscoreMatch(userId, match.score, checkUser.total_matches)
                } else {
                    const otherUpdate = await userRepository.updateTotalMatch(userId, checkUser.total_matches)
                }
                matches.delete(userId)
                return responseData
            }

            const responseData = {
                message: 'Try again',
                code: -1,
                result: 'Lose',
                player_move: payload.move,
                computer_move: computerMove,
                data: { ...match, addedHealth: addedHealth},
            }
            return responseData
        }

        if(checkWin == 0){
            const responseData = {
                message: 'Try again',
                code: 0,
                result: 'Draw',
                player_move: payload.move,
                computer_move: computerMove,
                data: { ...match, addedHealth: addedHealth},
            }
            return responseData
        }

        match.level += 1
        match.score += 100*checkWin*multiplier
        match.winstreak += 1

        if(match.mode=='somethingspecial' && level % 5 == 0) {
            addedHealth = 1
            match.health += addedHealth
        }

        const responseData = {
            message: 'You win',
            code: 1,
            result: 'Win',
            player_move: payload.move,
            computer_move: computerMove,
            data: { ...match, addedHealth: addedHealth},
        }
        return responseData
    } catch (error) {
        throw error
    }
}

const getMatch = async (userId) => {
    if (!matches.has(userId)) {
        throw new Error('Match not found.');
    }
    return { match: matches.get(userId) }
} 

module.exports = {
    startMatch,
    updateMatch,
    getMatch
}
