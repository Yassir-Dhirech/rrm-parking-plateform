const fs = require('fs');
const content = fs.readFileSync('rrm_db (1).sql', 'utf8');

function showInserts(tableName) {
  const search = 'INSERT INTO `' + tableName + '`';
  let idx = content.indexOf(search);
  console.log('=== DATA: ' + tableName + ' ===');
  while (idx !== -1) {
    const end = content.indexOf(';\n', idx);
    console.log(content.substring(idx, Math.min(idx + 1000, end !== -1 ? end + 1 : idx + 1000)));
    idx = content.indexOf(search, idx + 1);
  }
}

showInserts('affectation_agent_parking');
showInserts('periode_abonnement');
showInserts('demande_operationnelle');
showInserts('paiement');
