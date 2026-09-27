const fs = require('fs');
const content = fs.readFileSync('rrm_db (1).sql', 'utf8');

function showTable(tableName) {
  const search = 'CREATE TABLE `' + tableName + '`';
  const idx = content.indexOf(search);
  if (idx !== -1) {
    console.log('=== ' + tableName + ' ===');
    console.log(content.substring(idx, content.indexOf(';', idx) + 1));
  } else {
    console.log('NOT FOUND: ' + tableName);
  }
}

showTable('periode_abonnement');
showTable('carte_acces');
showTable('demande_operationnelle');
showTable('paiement');
showTable('affectation_parking');
