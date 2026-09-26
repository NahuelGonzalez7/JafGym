const fs = require('fs');
require('dotenv').config();

const envFile = `export const environment = {
  production: false,
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_ANON_KEY}'
};
`;

fs.writeFileSync('./src/environments/environment.ts', envFile);
console.log('✅ environment.ts generado correctamente');