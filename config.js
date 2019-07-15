const {mergeEnv} = require('@welldone-software/env-config')

const config = {
  region: 'us-west-2',
  lambdaFunction: 'ssofrim-test',
  domain: 'localhost:3001',
  recaptchaSecret: '',
};

mergeEnv(config);

module.exports = config;
