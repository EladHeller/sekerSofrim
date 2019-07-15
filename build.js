const fs = require('fs');
const archiver = require('archiver');
const {Lambda} = require('aws-sdk');
const {region, lambdaFunction} = require('./config');

const isDev = process.argv[2] !== 'prod';
const lambda = new Lambda({region});

const output = fs.createWriteStream(`${process.argv[2] || 'dev'}.zip`);
const archive = archiver('zip', {
  zlib: {level: 9}, // Sets the compression level.
});

output.on('close', async () => {
  console.log(`${archive.pointer()} total bytes`);
  if (isDev) {
    console.log('uploading new lambda');
    await lambda.updateFunctionCode({
      FunctionName: lambdaFunction,
      ZipFile: fs.readFileSync('./src.zip'),
    }).promise();
  }
  console.log('finnish');
});

output.on('end', () => {
  console.log('Data has been drained');
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.log(err);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

archive.directory('src/', false);

archive.finalize();
