const fs = require('fs');
const path = require('path');

console.log('Start readFileSync index.html');
let indexHtml = fs.readFileSync(path.join(__dirname, '../app/index.html'), 'utf8');
// console.log(indexHtml);

// replace index.thml inline script
indexHtml = indexHtml.replace('<script>window.routerBase = "/";</script>', '');

console.log('Start writeFile index.html');
fs.writeFile(path.join(__dirname, '../app/index.html'), indexHtml, 'utf8', function(err, data) {
  if (err) throw err;
  console.log('Bin Successfully!');
});
