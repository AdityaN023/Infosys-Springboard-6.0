import mysql from "mysql2/promise";

let pool;

export function getDB() {
    if (!pool) {
        pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '#Aditya25',
            database: 'infosys_springboard',
            port: 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }
    
    return pool;
}
