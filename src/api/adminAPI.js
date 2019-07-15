const dal = require('../dal');
const sender = require('../sender');
const adminBL = require('../BL/adminBL');

const getUserDetailsConfirms = () => dal.scanTable('ChangeDetailsConfirmations');

const getUsersReport = async () => {
    const users = await dal.getUsersReport();
    const fields = ['ID', 'firstName', 'lastName', 'pseudonym','email', 'phone', 'tel', 'award', 'enterTime','password','isAdmin'];
    let data = [];
    data.push(fields);
    users.forEach(user => {
        data.push(fields.map(field => user[field] ? user[field].toString() : ''));
    });
    return data;
};

const replaceMessages = async (event) => {
    await dal.replaceMessages(event.messages);
    return { message: 'success' };
};

const uploadUsers = async (event) => {
    const users = event.users.map(user=> {
        const parsedUser = {...user};
        if (parsedUser.award) {
            parsedUser.award = Number(user.award).toFixed(2);
        }
        return parsedUser;
    });
    await adminBL.updateUsers(users);
    return {message: 'success'};
};

const confirmUserDetails = async (event) => {
    await dal.updateUserDetails(event.ID,
        null,
        event.firstName && event.firstName.trim(),
        event.lastName && event.lastName.trim(),
        event.pseudonym && event.pseudonym.trim(),
        event.email && event.email.trim(),
        event.phone && event.phone.trim(),
        event.tel && event.tel.trim());
    await dal.deleteConfirmDetails(event.ID);
    if (event.email) {
        await sender.sendMail([event.email],
            'פרטיך באתר סקר סופרים עודכנו בהצלחה!',
            '<p style="direction:rtl;">כעת ניתן לחזור לאתר: http://ssofrim.com ולעדכן את שמות ספריך ובכך לסיים את ההרשמה.</p>');
    } else if (event.phone) {
        await sender.sendSMS('פרטיך באתר סקר סופרים עודכנו בהצלחה!', event.phone);
    }
    return { isSaved: true, ID: event.ID };
};

module.exports = {
    replaceMessages,
    uploadUsers,
    getUsersReport,
    getUserDetailsConfirms,
    confirmUserDetails,
}