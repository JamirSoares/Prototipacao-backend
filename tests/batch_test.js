// Simple test script to exercise the /api/dashboard/registro/batch endpoint
// Usage: node tests/batch_test.js

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api/dashboard';

async function run() {
  try {
    console.log('Using API base:', API_BASE);
    const ops = [
      {
        type: 'insert',
        data: {
          hora: '08:00',
          referencia: 'TEST-REF',
          tempoPrevisto: 10,
          tempoRealizado: 10,
          custoFaccao: 1.23,
          previsto: 100,
          real: 100,
          retrabalho: 0,
          pessoasCelula: 3
        }
      }
    ];

    const res = await fetch(API_BASE + '/registro/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations: ops })
    });

    const json = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.error('Erro durante teste:', e);
    process.exit(1);
  }
}

run();
