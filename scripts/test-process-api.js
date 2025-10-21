#!/usr/bin/env node

const url = process.argv[2] || 'http://localhost:3000';

console.log('🔥 Testando processamento FIPE...');
console.log(`📍 URL: ${url}/api/process-fipe\n`);

fetch(`${url}/api/process-fipe`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(async (response) => {
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCESSO!\n');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ ERRO!\n');
      console.log(JSON.stringify(data, null, 2));
      process.exit(1);
    }
  })
  .catch((error) => {
    console.log('❌ ERRO DE CONEXÃO!\n');
    console.error(error.message);
    process.exit(1);
  });