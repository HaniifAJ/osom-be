require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL
const TERCES = process.env.TERCES
const PORT = process.env.PORT

module.exports = {
    DATABASE_URL,
    TERCES,
    PORT
}