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
    const domain = '7npxc1c5ll.execute-api.us-west-2.amazonaws.com';//'1tmm0szfph.execute-api.us-west-2.amazonaws.com';
    const cookieString = `${cookieToken}; domain=${domain}; expires=${date.toGMTString()};`;

    return {cookieString,cookieToken};
}

function createUserPassword(ID, mailAddress, phone) {
    const password = generatePassword();

    const hashedPassword = hashPassword(password);

    return new Promise((resolve, reject) => {
        dal.updatePassword(ID, hashedPassword).then(evt=>{
            const msg = `סיסמתך החדשה לאתר סקר סופרים היא ${password}`;
            if (evt.err) {
                resolve({ err : evt.err});
            } else if (mailAddress) {
                sender.sendMail([mailAddress], 'סיסמה חדשה לאתר סקר סופרים', msg)
                    .then(resolve)
                    .catch(reject);
            } else if (phone) {
                sender.sendSMS(msg, phone)
                    .then(resolve)
                    .catch(reject);
            }
        });
    });
}


const generatePassword = () => {
    let rnd = Math.random();
    const num = rnd.toString().substring(2, 7);
    let char = rnd.toString(36)[3];
    while (char === 'o') {
      rnd = Math.random();
      char = rnd.toString(36)[3];
    }
    const pos = Math.floor(Math.random() * 6);
    return `${num.slice(0, pos)}${char}${num.slice(pos)}`;
  }

module.exports = {
    hashPassword,
    createUserPassword,
    generateCookie,
}