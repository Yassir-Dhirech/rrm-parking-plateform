const fs = require('fs');
const content = fs.readFileSync('rrm_db (1).sql', 'utf8');

function checkConstraints(tableName) {
  const search = 'ALTER TABLE `' + tableName + '`';
  let idx = content.indexOf(search);
  while (idx !== -1) {
    const end = content.indexOf(';\n', idx);
    const snippet = content.substring(idx, end !== -1 ? end + 1 : idx + 400);
    if (snippet.includes('ADD UNIQUE') || snippet.includes('ADD PRIMARY KEY')) {
      console.log(snippet);
    }
    idx = content.indexOf(search, idx + 1);
  }
}

checkConstraints('periode_abonnement');
checkConstraints('carte_acces');
checkConstraints('demande_operationnelle');
checkConstraints('paiement');
checkConstraints('abonnement');
