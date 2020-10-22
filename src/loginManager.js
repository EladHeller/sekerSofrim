const bcrypt = require('bcrypt');
const dal = require('./dal');
const sender = require('./sender');

const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(password, salt);
};

function generateCookie() {
    var date = new Date();

    // Get Unix milliseconds at current time plus 365 days
    date.setTime(+ date + (7 * 86400000)); //24 \* 60 \* 60 \* 1000
    const cookieVal = Math.random().toString(36).substring(7); // Generate a random cookie string
    const cookieToken = `token=${cookieVal}`;
    const cookieString = `${cookieToken}; domain=${process.env.DOMAIN}; expires=${date.toGMTString()}; SameSite=None; Secure`;

    return {cookieString,cookieToken};
}

async function createUserPassword(ID, mailAddress, phone) {
    const password = generatePassword();

    const hashedPassword = hashPassword(password);
    await dal.updatePassword(ID, hashedPassword);
    const msg = `סיסמתך החדשה לאתר סקר סופרים היא ${password}`;
    if (mailAddress) {
        return sender.sendMail([mailAddress],
            'סיסמה חדשה לאתר סקר סופרים',
            `<p style="direction:rtl;">${msg}</p>`);
    } else if (phone) {
        return sender.sendSMS(msg, phone);
    }
}


const generatePassword = () => {
    let rnd = Math.random();
    const num = rnd.toString().substring(2, 7);
    let char = String.fromCharCode(Math.floor(rnd * 26) + 65);
    while (char === 'O') {
      rnd = Math.random();
      char = String.fromCharCode(Math.floor(rnd * 26) + 65);
    }
    const pos = Math.floor(Math.random() * 6);
    return `${num.slice(0, pos)}${char}${num.slice(pos)}`;
  }

module.exports = {
    hashPassword,
    createUserPassword,
    generateCookie,
}