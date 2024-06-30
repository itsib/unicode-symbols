const fs = require('fs');
const path = require('path');

const filesPath = path.resolve(__dirname, '../main/data');

const last = 0xFFFF;
const delta = 0x80;
let current = 0x00;

while (last > current) {
  const rangeFrom = current;
  current = current + delta;
  const rangeTo = current - 1;

  const rangeFromHex = rangeFrom.toString(16).padStart(4, '0').toUpperCase();
  const rangeToHex = rangeTo.toString(16).padStart(4, '0').toUpperCase();

  const filename = `range-${rangeFromHex}-${rangeToHex}.json`;
  const filePath = path.resolve(filesPath, filename);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf8');
    console.log(`Created - ${filename}`);
  } else {
    console.log(`Exist - ${filename}`);
  }


}