// 🔧 JFX MD-X by JEPHTER TECH
// 🌐 Powered DB Engine — SQLite / Postgres Supported

const Sequelize = require('sequelize');

class DatabaseManager {
    static instance = null;

    static getInstance() {
        if (!DatabaseManager.instance) {
            const DATABASE_URL = process.env.DATABASE_URL || './database.db';

            DatabaseManager.instance =
                DATABASE_URL === './database.db'
                    ? new Sequelize({
                          dialect: 'sqlite',
                          storage: DATABASE_URL,
                          logging: false,
                      })
                    : new Sequelize(DATABASE_URL, {
                          dialect: 'postgres',
                          ssl: true,
                          protocol: 'postgres',
                          dialectOptions: {
                              native: true,
                              ssl: { require: true, rejectUnauthorized: false },
                          },
                          logging: false,
                      });
        }
        return DatabaseManager.instance;
    }
}

const DATABASE = DatabaseManager.getInstance();

DATABASE.sync()
    .then(() => {
        console.log('✅ JFX MD-X Database synchronized successfully.');
    })
    .catch((error) => {
        console.error('❌ JFX MD-X Database sync error:', error);
    });

module.exports = { DATABASE };
