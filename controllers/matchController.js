const matches = new Map();
const matchRepository = require('../repository/matchRepository')
const userRepository = require('../repository/userRepository');
const socketRepository = require('../repository/socketRepository')

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

const abortMatch = async (userId) => {
    if (!matches.has(userId)) {
        throw new Error('Match not found.');
    }
    if(matches[userId].opponentId != null) {
        throw new Error('Match is PvP. Please use Abort PvP instead.');
    }
    matches.delete(userId)
    return { message: "Match is aborted"}
}

let waitingRoom = null

const startPvP = async (io, userId) => {
    try {
        if(matches.has(userId)){
            throw new Error('Match already exists for this user.');
        }
        if(waitingRoom == null) {
            waitingRoom = {
                userId: userId,
                socketId: socketRepository.userSocket[userId]
            }
            console.log(`waiting room user ${userId} socket ${waitingRoom.socketId}`)
            return {message: 'Waiting for player to match with...'}
        }
        const firstPlayer = await userRepository.getUserById(waitingRoom.userId)
        const secondPlayer = await userRepository.getUserById(userId)
        let firstRes = {
            userId: waitingRoom.userId,
            level: 1,
            health: 5,
            score: 0,
            winstreak: 0,
            opponentName: secondPlayer.fullname,
            mode: 'pvp'
        }
        let firstMatch = {
            ...firstRes,
            opponentId: secondPlayer.id,
            myMove: null,
            opponentMove: null
        }

        let secondRes = {
            userId: userId,
            level: 1,
            health: 5,
            score: 0,
            winstreak: 0,
            opponentName: firstPlayer.fullname,
            mode: 'pvp'
        }
        let secondMatch = {
            ...secondRes,
            opponentId: firstPlayer.id,
            myMove: null,
            opponentMove: null
        }

        matches.set(firstMatch.userId, firstMatch)
        matches.set(secondMatch.userId, secondMatch)
        console.log('controller startMatch PvP:', firstMatch.userId, secondMatch.userId)
        io.to(firstRes.userId).emit('game-started', {data: firstRes})
        io.to(secondRes.userId).emit('game-started', {data: secondRes})

        waitingRoom = null

        return {message: 'match successfully started'}
    } catch (error) {
        console.error('scope: matchController, startPvP:', error)
        throw error
    }
}

const updatePvP = async (io, userId, payload) => {
    const { move } = payload
    try {
        if(!matches.has(userId)){
            throw new Error('Match not found.');
        }

        const opponentId = matches[userId].opponentId
        const playerMatch = matches[userId]
        const opponentMatch = matches[opponentId]
        playerMatch.myMove = move
        opponentMatch.opponentMove = move

        if(playerMatch.opponentMove == null) return {message: 'Your move has been successfully recorderd. Waiting for opponent move.'}

        const checkWin = gameLogic(playerMatch.myMove, playerMatch.opponentMove)

        if(checkWin == 0) {
            console.log(`Draw ${userId} and ${opponentId}`)
            let commonResp = {
                message: 'Try again',
                code: 0,
                result: 'Draw',
            }
            let playerResponse = {
                ...commonResp,
                player_move: playerMatch.myMove,
                opponent_move: playerMatch.opponentMove,
                data: {
                    userId: playerMatch.userId,
                    level: playerMatch.level,
                    health: playerMatch.health,
                    score: playerMatch.score,
                    winstreak: playerMatch.winstreak,
                    opponentName: playerMatch.opponentName,
                    mode: playerMatch.mode,
                    addedHealth: 0,
                }
            }
            let opponentResponse = {
                ...commonResp,
                player_move: opponentMatch.myMove,
                opponent_move: opponentMatch.opponentMove,
                data: {
                    userId: opponentMatch.userId,
                    level: opponentMatch.level,
                    health: opponentMatch.health,
                    score: opponentMatch.score,
                    winstreak: opponentMatch.winstreak,
                    opponentName: opponentMatch.opponentName,
                    mode: opponentMatch.mode,
                    addedHealth: 0,
                }
            }
            io.to(socketRepository.userSocket[userId]).emit('match-result', {data: playerResponse})
            io.to(socketRepository.userSocket[opponentId]).emit('match-result', {data: opponentResponse})
            playerMatch.myMove = null, playerMatch.opponentMove = null
            opponentMatch.myMove = null, opponentMatch.opponentMove = null
            return {message: 'Match result will be sent'}
        }

        let multiplier1 = 1, multiplier2 = 1
        if(playerMatch.winstreak + 1 >= 2) multiplier1 = 2
        if(playerMatch.winstreak + 1 >= 4) multiplier1 = 3
        if(playerMatch.winstreak + 1 >= 9) multiplier1 = 5
        if(opponentMatch.winstreak + 1 >= 2) multiplier2 = 2
        if(opponentMatch.winstreak + 1 >= 4) multiplier2 = 3
        if(opponentMatch.winstreak + 1 >= 9) multiplier2 = 5

        let addedHealth1 = 0, addedHealth2 = 0

        
        if(checkWin < 0) {
            addedHealth1 = -1
            multiplier1 = 0
            playerMatch.winstreak = 0
            opponentMatch.winstreak += 1
            
            playerMatch.health += addedHealth1
            opponentMatch.health += addedHealth2
            playerMatch.score += 100*multiplier1
            opponentMatch.score += 100*multiplier2
            playerMatch.level += 1
            opponentMatch.level += 1
        } else if (checkWin > 0) {
            addedHealth2 = -1
            multiplier2 = 0
            opponentMatch.winstreak = 0
            playerMatch.winstreak += 1

            playerMatch.health += addedHealth1
            opponentMatch.health += addedHealth2
            playerMatch.score += 100*multiplier1
            opponentMatch.score += 100*multiplier2
            playerMatch.level += 1
            opponentMatch.level += 1
        }

        let winResp = {
            message: 'You Win',
            code: 1,
            result: 'Win',
        }

        let loseResp = {
            message: 'You Lose',
            code: -1,
            result: 'Lose'
        }

        let playerResponse = {
            player_move: playerMatch.myMove,
            opponent_move: playerMatch.opponentMove,
            data: {
                userId: playerMatch.userId,
                level: playerMatch.level,
                health: playerMatch.health,
                score: playerMatch.score,
                winstreak: playerMatch.winstreak,
                opponentName: playerMatch.opponentName,
                mode: playerMatch.mode,
                addedHealth: addedHealth1,
            }
        }

        let opponentResponse = {
            player_move: opponentMatch.myMove,
            opponent_move: opponentMatch.opponentMove,
            data: {
                userId: opponentMatch.userId,
                level: opponentMatch.level,
                health: opponentMatch.health,
                score: opponentMatch.score,
                winstreak: opponentMatch.winstreak,
                opponentName: opponentMatch.opponentName,
                mode: opponentMatch.mode,
                addedHealth: addedHealth2,
            }
        }
        
        if(playerMatch.health == 0 || opponentMatch.health == 0) {
            let winResp = {
                message: 'Match is over. You win.',
                code: 2,
                result: 'Win',
            }
    
            let loseResp = {
                message: 'Match is over. You lose.',
                code: -2,
                result: 'Lose'
            }

            const newRow1 = {
                user_id: playerMatch.userId,
                level: playerMatch.level,
                score: playerMatch.score,
                mode: playerMatch.mode,
                opponent: playerMatch.opponentId
            }
            const newRow2 = {
                user_id: opponentMatch.userId,
                level: opponentMatch.level,
                score: opponentMatch.score,
                mode: opponentMatch.mode,
                opponent: opponentMatch.opponentId
            }
            const result1 = await matchRepository.registerMatch(newRow1)
            const result2 = await matchRepository.registerMatch(newRow1)

            if(checkWin > 0) {
                playerResponse = {...playerResponse, ...winResp}
                opponentResponse = {...opponentResponse, ...loseResp}
            }
            else {
                playerResponse = {...playerResponse, ...loseResp}
                opponentResponse = {...opponentResponse, ...winResp}
            }

            io.to(socketRepository.userSocket[userId]).emit('match-result', {data: playerResponse})
            io.to(socketRepository.userSocket[opponentId]).emit('match-result', {data: opponentResponse})
            playerMatch.myMove = null, playerMatch.opponentMove = null
            opponentMatch.myMove = null, opponentMatch.opponentMove = null

            const checkUser1 = await userRepository.getUserById(userId)
            const otherUpdate1 = await userRepository.updateTotalMatch(userId, checkUser1.total_matches)
            const checkUser2 = await userRepository.getUserById(opponentId)
            const otherUpdate2 = await userRepository.updateTotalMatch(opponentId, checkUser2.total_matches)

            return {message: 'Match result will be sent'}
        }

        if(checkWin > 0) {
            playerResponse = {...playerResponse, ...winResp}
            opponentResponse = {...opponentResponse, ...loseResp}
        }
        else {
            playerResponse = {...playerResponse, ...loseResp}
            opponentResponse = {...opponentResponse, ...winResp}
        }

        io.to(socketRepository.userSocket[userId]).emit('match-result', {data: playerResponse})
        io.to(socketRepository.userSocket[opponentId]).emit('match-result', {data: opponentResponse})
        playerMatch.myMove = null, playerMatch.opponentMove = null
        opponentMatch.myMove = null, opponentMatch.opponentMove = null
        return {message: 'Match result will be sent'}
    } catch (error) {
        console.error('scope: matchController, updatePvP:', error)
        throw error
    }
}

module.exports = {
    startMatch,
    updateMatch,
    getMatch,
    abortMatch,
    startPvP,
    updatePvP
}
