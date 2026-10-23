import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('deepXauth');

function cleanWorker(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(
    /const credentialsToTry = \[\s*\{\s*email: 'sdk_worker@deepxauth\.com'[\s\S]*?\}\s*\];/g,
    `const credentialsToTry = [
            { email: env?.FIREBASE_AUTH_EMAIL, password: env?.FIREBASE_AUTH_PASSWORD },
            { email: 'sdk_worker@notexe.com', password: env?.FIREBASE_AUTH_PASSWORD || 'WorkerPassword123!#' }
        ].filter(c => c.email && c.password);`
  );

  content = content.replace(/sdk_worker@deepxauth\.com/g, 'sdk_worker@notexe.com');
  content = content.replace(/DeepXAuth/g, 'Not Exe');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Cleaned ' + filePath);
}

cleanWorker(path.join(ROOT, 'functions', '[[route]].js'));
cleanWorker(path.join(ROOT, 'src', 'index.js'));
