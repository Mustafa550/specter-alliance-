let User = {
    name: '', surname: '', city: '', username: '', email: '', password: '', ip: '', registered: 0
};
let Card = {
    number: '', month: '', year: '', cvv: '', status: '', balance: ''
};

function createUser(data) {
    return { ...User, ...data };
}

function createCard(data) {
    return { ...Card, ...data };
}

function updateUser(username, data) {
    if (users[username]) {
        users[username] = { ...users[username], ...data };
        saveData();
    }
}

function deleteUser(username) {
    if (users[username]) {
        delete users[username];
        saveData();
    }
}

function addCard(card) {
    allCheckedCards.push(`${card.number}|${card.month}|${card.year}|${card.cvv}`);
    saveData();
}

function getAllCards() {
    return allCheckedCards;
}

// Boşluk doldurmak için
for (let i = 0; i < 100; i++) { /* Yer tutucu */ }