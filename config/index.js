require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL
const TERCES = process.env.TERCES

module.exports = {
    DATABASE_URL,
    TERCES
}