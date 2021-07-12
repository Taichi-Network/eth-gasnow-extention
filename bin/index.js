const fs = require('fs');
const path = require('path');

console.log('Start readFileSync index.html');

if (!fs.existsSync(path.join(__dirname, '../app/'))){
  fs.mkdirSync(path.join(__dirname, '../app/'));
}
fs.copyFileSync(path.join(__dirname, '../public/manifest.json'), path.join(__dirname, '../app/manifest.json'))

let indexHtml = fs.readFileSync(path.join(__dirname, '../app/index.html'), { encoding: 'utf-8', flag: 'r+' });
// console.log(indexHtml);

// replace index.thml inline script
indexHtml = indexHtml.replace('<script>window.routerBase = "/";</script>', '');

console.log('Start writeFile index.html');
fs.writeFile(path.join(__dirname, '../app/index.html'), indexHtml, 'utf8', function(err, data) {
  if (err) throw err;
  console.log('Bin Successfully!');
});
