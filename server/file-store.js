fs = require('fs');
// fs.readFile('../client/client/index.html', 'utf8', function (err,data) {
//   if (err) {
//     return console.log(err);
//   }
//   console.log(data);
// });

var loadFile = function(filename, cb) {
  console.log('Loading ', filename);
  fs.readFile(filename, 'utf8', cb);
};

module.exports = {
  loadFile: loadFile
};