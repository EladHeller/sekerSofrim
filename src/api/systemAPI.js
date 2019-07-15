const dal = require('../dal');

const saveErrorLog = async event => dal.saveErrorLog(event.err, {client: true})
    

module.exports = {
    saveErrorLog,
};