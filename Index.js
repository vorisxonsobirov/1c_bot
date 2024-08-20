const TelegramBot = require('node-telegram-bot-api');
const db = require('./database'); // Импортируем файл с базой данных

const token = '6647650094:AAEgNT5mmqyCzsiBv_Omn_fep544OpklExw'; // Замени на свой токен
const bot = new TelegramBot(token, { polling: true });

// Словарь категорий и товаров
const categories = {
    'Холодильники и морозильники': ['Холодильник LG', 'Морозильник Samsung', 'Холодильник Bosch', 'Морозильник Indesit', 'Холодильник Haier'],
    'Стиральные машины и сушилки': ['Стиральная машина LG', 'Сушилка Samsung', 'Стиральная машина Bosch', 'Сушилка Indesit', 'Стиральная машина Haier'],
    'Плиты и духовые шкафы': ['Плита Gorenje', 'Духовка Samsung', 'Плита Bosch', 'Духовка Indesit', 'Плита Haier'],
    'Микроволновые печи': ['Микроволновка LG', 'Микроволновка Samsung', 'Микроволновка Bosch', 'Микроволновка Panasonic', 'Микроволновка Sharp'],
    'Посудомоечные машины': ['Посудомоечная машина Bosch', 'Посудомоечная машина Siemens', 'Посудомоечная машина LG', 'Посудомоечная машина Samsung', 'Посудомоечная машина Haier'],
    'Пылесосы и пароочистители': ['Пылесос Dyson', 'Пылесос Samsung', 'Пылесос Bosch', 'Пароочиститель Karcher', 'Пылесос Philips'],
    'Кондиционеры и вентиляторы': ['Кондиционер LG', 'Кондиционер Samsung', 'Вентилятор Dyson', 'Кондиционер Daikin', 'Вентилятор Xiaomi'],
    'Утюги и гладильные системы': ['Утюг Tefal', 'Утюг Philips', 'Гладильная система Miele', 'Утюг Braun', 'Гладильная система Bosch'],
    'Кофемашины и чайники': ['Кофемашина DeLonghi', 'Кофемашина Bosch', 'Чайник Tefal', 'Кофемашина Philips', 'Чайник Braun'],
    'Мелкая бытовая техника для кухни': ['Тостер Philips', 'Блендер Bosch', 'Мясорубка Moulinex', 'Кухонный комбайн Kenwood', 'Соковыжималка Panasonic']
};

// Команда /start с меню
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Выбери действие:', {
        reply_markup: {
            keyboard: [
                [{ text: 'Информация о товаре' }],
                [{ text: 'Мои заказы' }],
                [{ text: 'Помощь' }],
                [{ text: 'Отправить контакт', request_contact: true }] // Кнопка для отправки контакта
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

// Обработка сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const firstName = msg.from.first_name;
    const lastName = msg.from.last_name || '';
    const username = msg.from.username ? `@${msg.from.username}` : 'Без username';

    if (msg.contact) {
        const contact = msg.contact;
        const phoneNumber = contact.phone_number;

        // Добавление или обновление пользователя в базе данных
        db.upsertUser(userId.toString(), firstName, lastName, username, phoneNumber);

        bot.sendMessage(chatId, `Спасибо за отправленный контакт!\n` +
            `Имя: ${contact.first_name}\n` +
            `Телефон: ${contact.phone_number}\n` +
            `Отправил: ${firstName} ${lastName}\n` +
            `Username: ${username}`);
    } else if (text === 'Информация о товаре') {
        bot.sendMessage(chatId, 'Выберите категорию:', {
            reply_markup: {
                keyboard: Object.keys(categories).map(category => [{ text: category }]),
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    } else if (categories[text]) {
        bot.sendMessage(chatId, `Товары в категории "${text}":\n\n` + categories[text].join('\n'), {
            reply_markup: {
                keyboard: [
                    [{ text: 'Назад в категории' }],
                    [{ text: 'Главное меню' }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    } else if (text === 'Назад в категории') {
        bot.sendMessage(chatId, 'Выберите категорию:', {
            reply_markup: {
                keyboard: Object.keys(categories).map(category => [{ text: category }]),
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    } else if (text === 'Главное меню') {
        bot.sendMessage(chatId, 'Выберите действие:', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Информация о товаре' }],
                    [{ text: 'Мои заказы' }],
                    [{ text: 'Помощь' }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    }
});

// Обработка ошибок polling
bot.on('polling_error', (error) => {
    console.error('Ошибка polling:', error.code);  // Выводит код ошибки
    console.error('Сообщение об ошибке:', error.message);  // Сообщение об ошибке
});
