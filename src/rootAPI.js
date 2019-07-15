const dal = require('./dal');
const {methodByResource} = require('./router');

const allowedOrigins = [
    'https://ssofrim.com',
    'https://www.ssofrim.com',
    'http://localhost:'
];

function isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
}


function getError(err) {
    let error;
    if (err) {
        let errorMsg;
        if (isString(err)) {
            errorMsg = err;
        } else if (err.message) {
            errorMsg = err.message;
        } else {
            errorMsg = err;
        }
        error = JSON.stringify({ errorMessage: errorMsg });
    }
    return error;
}

function getRes(res) {
    if (isString(res)) {
        return res;
    } else {
        return JSON.stringify(res);
    }
}

const getHeaders = (origin, contentType, cookieString) => {
    const headers = {
        'Content-Type': contentType || 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': true
    };
    if (cookieString) {
        headers['Set-Cookie'] = cookieString;
    }
    return headers;
};

async function rootApi(event) {
    console.log(event);
    let origin = event.headers.Origin || event.headers.origin;
    
    if (origin && allowedOrigins.some(org => origin.startsWith(org))) {
        try {
            console.log(event.path);
            const res = await methodByResource[event.path.toLowerCase()](event);
            return {
                body: getRes(res.body || res),
                statusCode: res.status || 200,
                headers: getHeaders(origin, res.contentType, res.cookieString)
            }
        } catch (e) {
            dal.saveErrorLog(e, event).catch(err => console.error('Failed to save error', err));
            return {
                body: getError(e),
                statusCode: 500,
                headers: getHeaders(origin)
            }
        }
    } else {
        return {
            body: 'no-cors',
            statusCode: 403,
            headers: getHeaders(origin)
        }
    }
}

module.exports = {
    rootApi,
}
