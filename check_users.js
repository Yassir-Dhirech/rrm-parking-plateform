const fs = require('fs');
const content = fs.readFileSync('rrm_db (1).sql', 'utf8');

function showQuery(title, pattern) {
  const idx = content.indexOf(pattern);
  if (idx !== -1) {
    const end = content.indexOf(';\n', idx);
    console.log('=== ' + title + ' ===');
    console.log(content.substring(idx, end !== -1 ? end + 1 : idx + 600));
  }
}

showQuery('UTILISATEURS', 'INSERT INTO `utilisateur`');
showQuery('PARKINGS', 'INSERT INTO `parking`');
