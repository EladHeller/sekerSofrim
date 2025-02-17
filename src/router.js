const phin = require('phin');
const dal = require('./dal');
const adminApi = require('./api/adminAPI');
const usersAPI = require('./api/usersAPI');
const messagesApi = require('./api/messagesApi');
const systemApi = require('./api/systemAPI');

const api = async (func) => (event) => {
  console.log('api', {event, func});
	const cookie = event.headers.Cookie;

	const requestBody = JSON.parse(event.body) || {};

	requestBody.Cookie = cookie;
	console.log(requestBody);
	func(requestBody);
}

const captchaApi = (func) => async (event) => {
  console.log('captchaApi', {event, func});
	const cookie = event.headers.Cookie;

	const requestBody = JSON.parse(event.body) || {};

	requestBody.Cookie = cookie;
	console.log(requestBody);
	const {body : {success}} = await phin({
		url: `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${event.captchaData}`,
		parse: 'json',
		method: 'POST',
	});
	if (success) {
		return func(requestBody);
	} else {
		return {
			body: 'Error',
			statusCode: 500.
		};
	}
}


const authorize = (func, admin) => async (event) => {
  console.log('authorize', {event, func});
  if (!event.headers.Cookie) {
      return {
        body: 'You need to log on for this action',
        statusCode: 401
      };
  } else {
      const data = await (admin ? dal.getUserByCookie(event.headers.Cookie) : dal.getIdByCookie(event.headers.Cookie));
      if (!data.Item || (admin && !(data.Item && data.Item.isAdmin))) {
        return {
          body: 'You don\'t have permissions for this action',
          statusCode: 401
        };
      } else {
          const requestBody = JSON.parse(event.body) || {};
          if (!admin) {
			requestBody.ID = data.Item.UID;
          }
          console.log(requestBody);
          return func(requestBody);
      }
  }
};

const authorizeAdmin = (func) => authorize(func, true);

const post = (func) => event => {
  console.log('post', {event, func});
  if (event.httpMethod.toLowerCase() !== 'post') {
    return {
      body: 'Method Not Allowed',
      statusCode:405
    };
  }
  return func(event);
};

const methodByResource = {
  '/idlogin': post(captchaApi(usersAPI.searchUserById)),
  '/getconnecteduser': post(api(usersAPI.getConnectedUser)),
  '/logout': post(api(usersAPI.logOut)),
  '/passwordlogin': post(captchaApi(usersAPI.passwordLogin)),
  '/resetpassword': post(api(usersAPI.resetPassword)),
  '/getmessages': post(api(messagesApi.getMessages)),
  '/updateuserdetails': post(authorize(usersAPI.updateUserDetails)),
  '/getuserdetailsconfirms': post(authorizeAdmin(adminApi.getUserDetailsConfirms)),
  '/getusersreport': post(authorizeAdmin(adminApi.getUsersReport)),
  '/uploadusers': post(authorizeAdmin(adminApi.uploadUsers)),
  '/requestupdateuserdetails': post(api(usersAPI.requestUpdateUserDetails)),
  '/confirmuserdetails': post(authorizeAdmin(adminApi.confirmUserDetails)),
  '/replacemessages': post(authorizeAdmin(adminApi.replaceMessages)),
  '/error': post(api(systemApi.saveErrorLog))
};

module.exports = {
  methodByResource,
};