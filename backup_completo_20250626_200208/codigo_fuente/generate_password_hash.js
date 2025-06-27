const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'whoS5un0%';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password hash:', hash);
}

generateHash(); 