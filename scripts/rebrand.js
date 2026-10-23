import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('deepXauth');

// 1. Update Landing.tsx
const landingPath = path.join(ROOT, 'pages', 'Landing.tsx');
if (fs.existsSync(landingPath)) {
  let landing = fs.readFileSync(landingPath, 'utf8');

  // Add BrandMark import if missing
  if (!landing.includes('import BrandMark from')) {
    landing = landing.replace(
      "import { SDK } from '../types';",
      "import { SDK } from '../types';\nimport BrandMark from '../components/BrandMark';"
    );
  }

  // Replace Python snippet
  landing = landing.replace(
    /const pythonSnippet = `import dxa[\s\S]*?print\(f"Authentication Failed: \{res\.error\}"\);?\s*`;/,
    `const pythonSnippet = \`import notexe

# Initialize Not Exe Auth Client
client = notexe.Client(
    app_name="MyApplication",
    secret_key="NXE-MASTER-SECRET-KEY"
)

# Authenticate User with HWID Lock
res = client.login(username="john_doe", password="Password123!")

if res.success:
    print(f"User Authorized! Expiry: {res.user.expiry}")
    print(f"Encrypted Cloud Variable: {client.get_var('LICENSE_KEY')}")
else:
    print(f"Authentication Failed: {res.error}")\`;`
  );

  // Replace C# snippet
  landing = landing.replace(
    /const csharpSnippet = `using DXA;[\s\S]*?Console\.WriteLine\(\$"Error: \{response\.ErrorMessage\}"\);\s*\};?/,
    `const csharpSnippet = \`using NotExe;

// Initialize Not Exe Client
var client = new NotExeClient("MyApplication", "NXE-MASTER-SECRET-KEY");

// Authenticate User & Validate Hardware Signature
var response = await client.AuthenticateAsync("john_doe", "Password123!");

if (response.Success) {
    Console.WriteLine($"Access Granted! Welcome {response.User.Username}");
    string cloudSecret = await client.GetVariableAsync("API_SECRET");
} else {
    Console.WriteLine($"Error: {response.ErrorMessage}");
}\`;`
  );

  // Replace Navbar brand
  landing = landing.replace(
    /<Link to="\/" className="flex items-center gap-3 group">[\s\S]*?<span className="font-bold text-xs uppercase tracking-\[0\.2em\] text-white group-hover:text-indigo-300 transition-colors">Deep X Auth<\/span>[\s\S]*?<\/Link>/,
    `<Link to="/" className="flex items-center gap-3 group">
              <BrandMark size="sm" />
            </Link>`
  );

  // Add Not Exe Mascot Image in Hero section right above the H1 title if not present
  if (!landing.includes('alt="Not Exe Mascot"')) {
    landing = landing.replace(
      '<div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full',
      `<div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-400 opacity-40 blur-2xl group-hover:opacity-75 transition duration-500 animate-pulse"></div>
                <img src="/logo.png" alt="Not Exe Mascot" className="relative w-28 h-28 sm:w-36 sm:h-36 object-contain filter drop-shadow-[0_10px_25px_rgba(245,158,11,0.5)] hover:scale-105 transition-transform duration-300" />
              </div>
            </div>
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full`
    );
  }

  // Update Hero Headline
  landing = landing.replace(
    'Enterprise Software <br />',
    'Next-Gen Software & Game <br />'
  );
  landing = landing.replace(
    '<span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">\n                Licensing & Security.\n              </span>',
    '<span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400">\n                Licensing & Anti-Crack Protection.\n              </span>'
  );

  // Update preview dashboard
  landing = landing.replace('dxa-dashboard-v2.preview', 'notexe-dashboard-v2.preview');
  landing = landing.replace(/DXA-9921-X48A-8812/g, 'NXE-9921-X48A-8812');
  landing = landing.replace(/DXA-4412-K992-1082/g, 'NXE-4412-K992-1082');
  landing = landing.replace('How Deep X Auth Guarantees Protection', 'How Not Exe Guarantees Protection');
  landing = landing.replace('What DXA Does', 'What Not Exe Does');

  // Replace footer brand
  landing = landing.replace(
    /<div className="md:col-span-2 space-y-4">[\s\S]*?<span className="font-bold text-xs uppercase tracking-widest text-white">Deep X Auth<\/span>[\s\S]*?<\/Link>/,
    `<div className="md:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <BrandMark size="sm" />
              </Link>`
  );

  landing = landing.replace(
    /DEEP X AUTHENTICATION\. ALL RIGHTS RESERVED\./g,
    'NOT EXE AUTHENTICATION. ALL RIGHTS RESERVED.'
  );

  fs.writeFileSync(landingPath, landing, 'utf8');
  console.log('✓ Updated Landing.tsx');
}

// 2. Update Login.tsx
const loginPath = path.join(ROOT, 'pages', 'Login.tsx');
if (fs.existsSync(loginPath)) {
  let login = fs.readFileSync(loginPath, 'utf8');

  login = login.replace(/Deep X Auth/g, 'Not Exe');
  login = login.replace(/DeepXAuth/g, 'Not Exe');
  login = login.replace(/DXA-/g, 'NXE-');
  login = login.replace(/dxa_secret/g, 'notexe_secret');

  // Add Not Exe mascot logo above login card if not present
  if (!login.includes('src="/logo.png"')) {
    login = login.replace(
      '<div className="text-center mb-8">',
      `<div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-amber-500/30 blur-lg"></div>
            <img src="/logo.png" alt="Not Exe" className="relative w-16 h-16 object-contain filter drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
          </div>
        </div>
        <div className="text-center mb-8">`
    );
  }

  fs.writeFileSync(loginPath, login, 'utf8');
  console.log('✓ Updated Login.tsx');
}

// 3. Update Signup.tsx
const signupPath = path.join(ROOT, 'pages', 'Signup.tsx');
if (fs.existsSync(signupPath)) {
  let signup = fs.readFileSync(signupPath, 'utf8');

  signup = signup.replace(/Deep X Auth/g, 'Not Exe');
  signup = signup.replace(/DeepXAuth/g, 'Not Exe');
  signup = signup.replace(/DXA-/g, 'NXE-');

  // Add Not Exe mascot logo above signup card if not present
  if (!signup.includes('src="/logo.png"')) {
    signup = signup.replace(
      '<div className="text-center mb-8">',
      `<div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-amber-500/30 blur-lg"></div>
            <img src="/logo.png" alt="Not Exe" className="relative w-16 h-16 object-contain filter drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
          </div>
        </div>
        <div className="text-center mb-8">`
    );
  }

  fs.writeFileSync(signupPath, signup, 'utf8');
  console.log('✓ Updated Signup.tsx');
}

// 4. Update ForgotPassword.tsx
const forgotPath = path.join(ROOT, 'pages', 'ForgotPassword.tsx');
if (fs.existsSync(forgotPath)) {
  let forgot = fs.readFileSync(forgotPath, 'utf8');
  forgot = forgot.replace(/Deep X Auth/g, 'Not Exe');
  forgot = forgot.replace(/DeepXAuth/g, 'Not Exe');
  fs.writeFileSync(forgotPath, forgot, 'utf8');
  console.log('✓ Updated ForgotPassword.tsx');
}

// 5. Update TOS.tsx
const tosPath = path.join(ROOT, 'pages', 'TOS.tsx');
if (fs.existsSync(tosPath)) {
  let tos = fs.readFileSync(tosPath, 'utf8');
  tos = tos.replace(/Deep X Auth/g, 'Not Exe');
  tos = tos.replace(/DeepXAuth/g, 'Not Exe');
  tos = tos.replace(/DXA/g, 'Not Exe');
  fs.writeFileSync(tosPath, tos, 'utf8');
  console.log('✓ Updated TOS.tsx');
}

// 6. Update Shop.tsx
const shopPath = path.join(ROOT, 'pages', 'Shop.tsx');
if (fs.existsSync(shopPath)) {
  let shop = fs.readFileSync(shopPath, 'utf8');
  shop = shop.replace(/Deep X Auth/g, 'Not Exe');
  shop = shop.replace(/DeepXAuth/g, 'Not Exe');
  shop = shop.replace(/DXA Credit/g, 'Not Exe Credit');
  shop = shop.replace(/DXA Credits/g, 'Not Exe Credits');
  shop = shop.replace(/DXA /g, 'Not Exe ');
  fs.writeFileSync(shopPath, shop, 'utf8');
  console.log('✓ Updated Shop.tsx');
}

// 7. Update ResellerPortal.tsx
const resellerPath = path.join(ROOT, 'pages', 'ResellerPortal.tsx');
if (fs.existsSync(resellerPath)) {
  let reseller = fs.readFileSync(resellerPath, 'utf8');
  reseller = reseller.replace(/Deep X Auth/g, 'Not Exe');
  reseller = reseller.replace(/DeepXAuth/g, 'Not Exe');
  reseller = reseller.replace(/DXA Reseller/g, 'Not Exe Reseller');
  reseller = reseller.replace(/DXA-/g, 'NXE-');
  fs.writeFileSync(resellerPath, reseller, 'utf8');
  console.log('✓ Updated ResellerPortal.tsx');
}

// 8. Update Dashboard.tsx
const dashboardPath = path.join(ROOT, 'pages', 'Dashboard.tsx');
if (fs.existsSync(dashboardPath)) {
  let dash = fs.readFileSync(dashboardPath, 'utf8');
  dash = dash.replace(/Deep X Auth/g, 'Not Exe');
  dash = dash.replace(/DeepXAuth/g, 'Not Exe');
  dash = dash.replace(/'DXA-'/g, "'NXE-'");
  dash = dash.replace(/`DXA-/g, '`NXE-');
  dash = dash.replace(/DXA Secret/g, 'Not Exe Secret');
  dash = dash.replace(/dxa_audit_logs/g, 'notexe_audit_logs');
  fs.writeFileSync(dashboardPath, dash, 'utf8');
  console.log('✓ Updated Dashboard.tsx');
}

// 9. Update Admin.tsx
const adminPath = path.join(ROOT, 'pages', 'Admin.tsx');
if (fs.existsSync(adminPath)) {
  let admin = fs.readFileSync(adminPath, 'utf8');
  admin = admin.replace(/Deep X Auth/g, 'Not Exe');
  admin = admin.replace(/DeepXAuth/g, 'Not Exe');
  admin = admin.replace(/DXA Admin/g, 'Not Exe Admin');
  fs.writeFileSync(adminPath, admin, 'utf8');
  console.log('✓ Updated Admin.tsx');
}

// 10. Update Docs.tsx
const docsPath = path.join(ROOT, 'pages', 'Docs.tsx');
if (fs.existsSync(docsPath)) {
  let docs = fs.readFileSync(docsPath, 'utf8');
  docs = docs.replace(/Deep X Auth/g, 'Not Exe');
  docs = docs.replace(/DeepXAuth/g, 'Not Exe');
  docs = docs.replace(/DXA/g, 'Not Exe');
  docs = docs.replace(/https:\/\/deepxauth\.pages\.dev/g, 'https://notexe.pages.dev');
  fs.writeFileSync(docsPath, docs, 'utf8');
  console.log('✓ Updated Docs.tsx');
}

// 11. Update functions/[[route]].js and src/index.js
const routePath = path.join(ROOT, 'functions', '[[route]].js');
if (fs.existsSync(routePath)) {
  let route = fs.readFileSync(routePath, 'utf8');
  route = route.replace(/Deep X Auth API is Active\./g, 'Not Exe API is Active.');
  route = route.replace(/DeepXAuth Edge Security System/g, 'Not Exe Edge Security System');
  route = route.replace(/DXA Security Alert/g, 'Not Exe Security Alert');
  route = route.replace(/'MyDeepXAuthSecretKey_2026!#'/g, "(c.env && c.env.DB_SECRET) ? c.env.DB_SECRET : 'NotExeSecretKey_2026!#'");
  route = route.replace(/NOTEXE_RESPONSE_SIGNING_PRIVATE_KEY_PEM \|\| env\.DXA_RESPONSE_SIGNING_PRIVATE_KEY_PEM/g, 'NOTEXE_RESPONSE_SIGNING_PRIVATE_KEY_PEM');
  route = route.replace(/env\.DXA_RESPONSE_SIGNING_PRIVATE_KEY_PEM \|\| env\.TXA_RESPONSE_SIGNING_PRIVATE_KEY_PEM/g, '(env.NOTEXE_RESPONSE_SIGNING_PRIVATE_KEY_PEM || env.DXA_RESPONSE_SIGNING_PRIVATE_KEY_PEM || env.TXA_RESPONSE_SIGNING_PRIVATE_KEY_PEM)');
  fs.writeFileSync(routePath, route, 'utf8');
  console.log('✓ Updated functions/[[route]].js');
}

const srcIndexPath = path.join(ROOT, 'src', 'index.js');
if (fs.existsSync(srcIndexPath)) {
  let srcIndex = fs.readFileSync(srcIndexPath, 'utf8');
  srcIndex = srcIndex.replace(/Deep X Auth API is Active\./g, 'Not Exe API is Active.');
  srcIndex = srcIndex.replace(/DXA Pages API/g, 'Not Exe API');
  srcIndex = srcIndex.replace(/'MyDeepXAuthSecretKey_2026!#'/g, "(c.env && c.env.DB_SECRET) ? c.env.DB_SECRET : 'NotExeSecretKey_2026!#'");
  fs.writeFileSync(srcIndexPath, srcIndex, 'utf8');
  console.log('✓ Updated src/index.js');
}

// 12. Update services/auditService.ts
const auditPath = path.join(ROOT, 'services', 'auditService.ts');
if (fs.existsSync(auditPath)) {
  let audit = fs.readFileSync(auditPath, 'utf8');
  audit = audit.replace(/dxa_audit_logs/g, 'notexe_audit_logs');
  audit = audit.replace(/DeepXAuth/g, 'Not Exe');
  audit = audit.replace(/DXA/g, 'Not Exe');
  fs.writeFileSync(auditPath, audit, 'utf8');
  console.log('✓ Updated services/auditService.ts');
}

// 13. Update wrangler.toml
const wranglerPath = path.join(ROOT, 'wrangler.toml');
if (fs.existsSync(wranglerPath)) {
  let wrangler = fs.readFileSync(wranglerPath, 'utf8');
  wrangler = wrangler.replace(/name = "deepxauth-cfire"/g, 'name = "notexe-auth"');
  fs.writeFileSync(wranglerPath, wrangler, 'utf8');
  console.log('✓ Updated wrangler.toml');
}

console.log('All branding replacements complete!');
