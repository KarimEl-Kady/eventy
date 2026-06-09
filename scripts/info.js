const os = require('os');
const ip = Object.values(os.networkInterfaces())
  .flat()
  .find(i => i.family === 'IPv4' && !i.internal)?.address || 'localhost';

console.log('');
console.log('  ═══════════════════════════════════════════════════');
console.log('  🎉 Eventy is running!');
console.log('  ═══════════════════════════════════════════════════');
console.log('');
console.log('  🗄  Database:  postgresql://postgres:postgres@localhost:5432/eventy');
console.log('  🚀 API:       http://localhost:3000');
console.log('  🌐 Web:       http://localhost:5173');
console.log('  📱 Mobile:    exp://' + ip + ':8081');
console.log('');
console.log('  💡 Scan the QR code in the Expo terminal with Expo Go');
console.log('  ═══════════════════════════════════════════════════');
console.log('');
