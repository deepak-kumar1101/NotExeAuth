import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('deepXauth');

// 1. Update services/sdkService.ts
const sdkPath = path.join(ROOT, 'services', 'sdkService.ts');
if (fs.existsSync(sdkPath)) {
  let sdk = fs.readFileSync(sdkPath, 'utf8');

  sdk = sdk.replace(/https:\/\/github\.com\/deepak-kumar1101\/deepXauth-/g, 'https://github.com/notexe-auth/notexe-');
  sdk = sdk.replace(/https:\/\/deepxauth\.pages\.dev/g, 'https://notexe.pages.dev');
  sdk = sdk.replace(/https:\/\/deepxauth-api\.pages\.dev/g, 'https://notexe.pages.dev');
  sdk = sdk.replace(/deepxauth\.pages\.dev/g, 'notexe.pages.dev');
  sdk = sdk.replace(/deepxauth-api\.pages\.dev/g, 'notexe.pages.dev');
  sdk = sdk.replace(/DXAAuth/g, 'NotExeAuth');
  sdk = sdk.replace(/DXAClient/g, 'NotExeClient');
  sdk = sdk.replace(/DXAService/g, 'NotExeService');
  sdk = sdk.replace(/DXAOptions/g, 'NotExeOptions');
  sdk = sdk.replace(/\[DXA\]/g, '[NotExe]');
  sdk = sdk.replace(/package com\.deepxauth\.sdk;/g, 'package com.notexe.sdk;');
  sdk = sdk.replace(/DXA-XXXX-YYYY-ZZZZ/g, 'NXE-XXXX-YYYY-ZZZZ');

  fs.writeFileSync(sdkPath, sdk, 'utf8');
  console.log('✓ Updated services/sdkService.ts');
}

// 2. Update services/sandboxService.ts
const sandboxPath = path.join(ROOT, 'services', 'sandboxService.ts');
if (fs.existsSync(sandboxPath)) {
  let sb = fs.readFileSync(sandboxPath, 'utf8');

  sb = sb.replace(/'X-Client-Platform': 'DXA-Sandbox\/2\.0'/g, "'X-Client-Platform': 'NotExe-Sandbox/2.0'");
  sb = sb.replace(/https:\/\/deepxauth\.pages\.dev/g, 'https://notexe.pages.dev');
  sb = sb.replace(/deepxauth\.pages\.dev/g, 'notexe.pages.dev');
  sb = sb.replace(/DeepXAuth/g, 'Not Exe');
  sb = sb.replace(/class DXAClient/g, 'class NotExeClient');
  sb = sb.replace(/callDeepXAuth/g, 'callNotExeAuth');
  sb = sb.replace(/DXA-XXXX-YYYY-ZZZZ/g, 'NXE-XXXX-YYYY-ZZZZ');
  sb = sb.replace(/\['deepxauth', 'pages', 'dev'\]/g, "['notexe', 'pages', 'dev']");

  fs.writeFileSync(sandboxPath, sb, 'utf8');
  console.log('✓ Updated services/sandboxService.ts');
}

// 3. Update hooks/useSandbox.ts
const useSandboxPath = path.join(ROOT, 'hooks', 'useSandbox.ts');
if (fs.existsSync(useSandboxPath)) {
  let usb = fs.readFileSync(useSandboxPath, 'utf8');
  usb = usb.replace(/dxa_sandbox_last_config/g, 'notexe_sandbox_last_config');
  usb = usb.replace(/dxa_sandbox_history/g, 'notexe_sandbox_history');
  fs.writeFileSync(useSandboxPath, usb, 'utf8');
  console.log('✓ Updated hooks/useSandbox.ts');
}

// 4. Update components/docs/
const reqBuilderPath = path.join(ROOT, 'components', 'docs', 'RequestBuilder.tsx');
if (fs.existsSync(reqBuilderPath)) {
  let rb = fs.readFileSync(reqBuilderPath, 'utf8');
  rb = rb.replace(/DXA-XXXX-YYYY-ZZZZ/g, 'NXE-XXXX-YYYY-ZZZZ');
  fs.writeFileSync(reqBuilderPath, rb, 'utf8');
  console.log('✓ Updated components/docs/RequestBuilder.tsx');
}

const respViewerPath = path.join(ROOT, 'components', 'docs', 'ResponseViewer.tsx');
if (fs.existsSync(respViewerPath)) {
  let rv = fs.readFileSync(respViewerPath, 'utf8');
  rv = rv.replace(/dxa_\$\{endpoint\.replace/g, 'notexe_${endpoint.replace');
  fs.writeFileSync(respViewerPath, rv, 'utf8');
  console.log('✓ Updated components/docs/ResponseViewer.tsx');
}

// 5. Update utils/rsaVerifier.ts
const rsaPath = path.join(ROOT, 'utils', 'rsaVerifier.ts');
if (fs.existsSync(rsaPath)) {
  let rsa = fs.readFileSync(rsaPath, 'utf8');
  if (!rsa.includes('NOTEXE_PUBLIC_KEY_PEM')) {
    rsa = rsa.replace(
      'export const DXA_PUBLIC_KEY_PEM =',
      'export const NOTEXE_PUBLIC_KEY_PEM = DXA_PUBLIC_KEY_PEM_VALUE;\nexport const DXA_PUBLIC_KEY_PEM ='
    );
    rsa = rsa.replace('export const DXA_PUBLIC_KEY_PEM = `', 'const DXA_PUBLIC_KEY_PEM_VALUE = `');
    rsa = rsa.replace('pemToArrayBuffer(DXA_PUBLIC_KEY_PEM)', 'pemToArrayBuffer(NOTEXE_PUBLIC_KEY_PEM || DXA_PUBLIC_KEY_PEM)');
    fs.writeFileSync(rsaPath, rsa, 'utf8');
    console.log('✓ Updated utils/rsaVerifier.ts');
  }
}
