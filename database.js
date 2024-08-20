const sqlite3 = require('sqlite3').verbose();

// Открытие базы данных (или создание, если она не существует)
const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error("Ошибка при открытии базы данных:", err.message);
    } else {
        console.log("База данных успешно открыта.");
    }
});

// Создание таблицы, если её нет
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        username TEXT,
        phone_number TEXT
    )`, (err) => {
        if (err) {
            console.error("Ошибка при создании таблицы:", err.message);
        } else {
            console.log("Таблица успешно создана.");
        }
    });
});

// Функция для добавления или обновления пользователя
function upsertUser(telegramId, firstName, lastName, username, phoneNumber) {
    const query = `INSERT INTO users (telegram_id, first_name, last_name, username, phone_number)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(telegram_id) DO UPDATE SET
                    first_name = excluded.first_name,
                    last_name = excluded.last_name,
                    username = excluded.username,
                    phone_number = excluded.phone_number`;

    db.run(query, [telegramId, firstName, lastName, username, phoneNumber], function (err) {
        if (err) {
            console.error('Ошибка при добавлении/обновлении пользователя:', err.message);
        } else {
            console.log('Пользователь добавлен/обновлён успешно');
        }
    });
}

// Функция для получения пользователя по Telegram ID
function getUserById(telegramId, callback) {
    const query = 'SELECT * FROM users WHERE telegram_id = ?';
    db.get(query, [telegramId], (err, row) => {
        if (err) {
            console.error('Ошибка при получении пользователя:', err.message);
        } else {
            callback(row);
        }
    });
}

module.exports = { upsertUser, getUserById };
