const dal = require('../dal');

const getMessages = () => dal.scanTable('Messages');

module.exports = {
    getMessages,
};
