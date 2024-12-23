require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL
const TERCES = process.env.TERCES
const PORT = process.env.PORT
const SOCKET_PORT = process.env.SOCKET_PORT

module.exports = {
    DATABASE_URL,
    TERCES,
    PORT,
    SOCKET_PORT
}