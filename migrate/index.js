const {updateUsers} = require('./migrateToBcrypt');

exports.handler = async (event) => {
  try {
    await updateUsers();
    const response = {
      statusCode: 200,
      body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
  } catch (error) {
    console.error({error});
    const response = {
      statusCode: 500,
      body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
  }
  
};
