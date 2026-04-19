const { execSync } = require('child_process');

function setEnv(key, value) {
  console.log(`Setting ${key}...`);
  try {
    execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' });
  } catch (e) {
    // Ignore error if it doesn't exist
  }
  execSync(`npx vercel env add ${key} production`, { input: value, env: process.env });
  console.log(`Successfully set ${key}`);
}

setEnv('LIVEKIT_URL', 'wss://project-zfbhjni3.livekit.cloud');
setEnv('NEXT_PUBLIC_LIVEKIT_URL', 'wss://project-zfbhjni3.livekit.cloud');
setEnv('LIVEKIT_API_KEY', 'APIYRVrA37gfnn9');
setEnv('LIVEKIT_API_SECRET', 'gSIp57EflFoBAf8nSOdaIGApKa5YCTgIfIN4eNlSZ1LB');

console.log('Done securely setting all environment variables without newlines!');
