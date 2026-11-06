const fs = require('fs');
require('dotenv').config();

// environment.ts para Angular
const angularEnvFile = `export const environment = {
  production: false,
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_ANON_KEY}'
};
`;
fs.writeFileSync('./src/environments/environment.ts', angularEnvFile);
console.log('✅ environment.ts (Angular) generado correctamente');

// environment.ts para Electron
const electronEnvFile = `export const environment = {
  ghToken: '${process.env.GH_TOKEN || ''}'
};
`;
fs.writeFileSync('./electron/environment.ts', electronEnvFile);
console.log('✅ environment.ts (Electron) generado correctamente');