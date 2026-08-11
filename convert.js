const crypto = require('crypto');
const fs = require('fs');

const content = fs.readFileSync('.env.local', 'utf8');
const match = content.match(/GITHUB_APP_PRIVATE_KEY="([^"]+)"/);
if (match) {
  let keyStr = match[1].replace(/\\n/g, '\n');
  const key = crypto.createPrivateKey({
    key: keyStr,
    format: 'pem'
  });
  
  const pkcs8 = key.export({
    type: 'pkcs8',
    format: 'pem'
  });
  
  const pkcs8Str = pkcs8.replace(/\n/g, '\\n');
  const newContent = content.replace(match[0], `GITHUB_APP_PRIVATE_KEY="${pkcs8Str}"`);
  fs.writeFileSync('.env.local', newContent);
  console.log("Updated .env.local with PKCS8 key.");
  console.log(pkcs8);
} else {
  console.log("Could not find GITHUB_APP_PRIVATE_KEY in .env.local");
}
