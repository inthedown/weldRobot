// config.js
let config = {}

if (process.env.NODE_ENV === 'development') {
  console.log('当前是开发环境');
  config.wsProt = '54320';
  config.serverPort = '54321';
} else {
  console.log('当前是生产环境');
  config.wsProt = '54321';
  config.serverPort = '54321';
}


export default config;