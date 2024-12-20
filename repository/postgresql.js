const { Pool } = require('pg');
const {DATABASE_URL} = require('../config')

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const getAllData = async (table) => {
    const client = await pool.connect();
    try {
        const { rows } = await client.query( `SELECT * FROM ${table}`);
        return rows;
    } catch (error) {
        console.error(`Error getting all data from ${table}:`, error.message)
        throw error
    } finally {
        client.release();
    }
}

const getDataByParam = async (table, params = {}) => {
    let paramQuery = '';
    let values = [];
    let count = 1;

    // Bangun query parameter dinamis
    for (let key in params) {
        if (paramQuery !== '') paramQuery += ' AND ';
        paramQuery += `${key} = $${count}`;
        values.push(params[key]);
        count++;
    }

    const client = await pool.connect();
    try {
        // Jika tidak ada parameter, ambil semua data
        const query = paramQuery
            ? `SELECT * FROM ${table} WHERE ${paramQuery}`
            : `SELECT * FROM ${table}`;
        const { rows } = await client.query(query, values);
        return rows;
    } catch (error) {
        console.error(`Error get data from ${table} with ${paramQuery}.`, error.message)
        throw error
    } finally {
        client.release();
    }
}

const insertRow = async (table, params = {}) => {
    console.log(process.env.DATABASE_URL)
    if (!table || Object.keys(params).length === 0) {
        throw new Error("Table name and parameters are required");
    }

    const paramKeys = Object.keys(params); // Ambil semua kunci parameter
    const paramValues = Object.values(params); // Ambil semua nilai parameter

    // Bangun query dinamis
    const columns = paramKeys.join(', '); // Gabungkan kunci dengan koma
    const placeholders = paramKeys.map((_, index) => `$${index + 1}`).join(', '); // Placeholder $1, $2, ...

    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;

    const client = await pool.connect();
    try {
        const { rows } = await client.query(query, paramValues);
        console.log(rows)
        return rows[0]; // Mengembalikan baris yang baru dimasukkan
    } catch (error) {
        console.error(`Error inserting row into ${table}:`, error.message);
        throw new Error(`Failed to insert row into ${table}: ${error.message}`);
    } finally {
        client.release();
    }
}

const updateRow = async (table, id, params = {}) => {
    if (!table || !id || Object.keys(params).length === 0) {
        throw new Error("Table name, ID, and parameters are required");
    }

    const paramKeys = Object.keys(params);
    const paramValues = Object.values(params);

    // Bangun query dinamis untuk SET
    const setQuery = paramKeys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    // Tambahkan ID sebagai parameter terakhir
    paramValues.push(id);

    const query = `UPDATE ${table} SET ${setQuery} WHERE id = $${paramKeys.length + 1} RETURNING *`;

    const client = await pool.connect();
    try {
        console.log(query, paramValues)
        const { rows } = await client.query(query, paramValues);
        if (rows.length === 0) {
            throw new Error(`No row found with id: ${id}`);
        }
        return rows[0]; // Mengembalikan baris yang diperbarui
    } catch (error) {
        console.error(`Error updating row in ${table}:`, error.message);
        throw new Error(`Failed to update row in ${table}: ${error.message}`);
    } finally {
        client.release();
    }
}

const deleteRow = async (table, id) => {
    if (!table || !id) {
        throw new Error("Table name and ID are required");
    }

    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;

    const client = await pool.connect();
    try {
        const { rows } = await client.query(query, [id]);
        if (rows.length === 0) {
            throw new Error(`No row found with id: ${id}`);
        }
        return rows[0]; // Mengembalikan baris yang dihapus
    } catch (error) {
        console.error(`Error deleting row from ${table}:`, error.message);
        throw new Error(`Failed to delete row from ${table}: ${error.message}`);
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    getAllData,
    getDataByParam,
    insertRow,
    updateRow,
    deleteRow
}


  