const path = require('path');

module.exports = path.dirname(process.mainModule.filename);
// process.mainModule.filename => gives us to the file that is 
// ... responsible for the fact that our application is running.