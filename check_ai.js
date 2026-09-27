const fs = require('fs');
const content = fs.readFileSync('rrm_db (1).sql', 'utf8');

function checkAutoIncrement(tableName) {
  const search = 'ALTER TABLE `' + tableName + '`';
  let idx = content.indexOf(search);
  while (idx !== -1) {
    const end = content.indexOf(';\n', idx);
    const snippet = content.substring(idx, end !== -1 ? end + 1 : idx + 400);
    if (snippet.includes('AUTO_INCREMENT')) {
      console.log(snippet);
    }
    idx = content.indexOf(search, idx + 1);
  }
}

checkAutoIncrement('periode_abonnement');
checkAutoIncrement('carte_acces');
checkAutoIncrement('demande_operationnelle');
checkAutoIncrement('paiement');
checkAutoIncrement('abonnement');
