const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  let count = 0;
  for (const [from, to] of replacements) {
    if (typeof from === 'string') {
      if (content.includes(from)) {
        content = content.split(from).join(to);
        count++;
      }
    } else if (from instanceof RegExp) {
      if (from.test(content)) {
        content = content.replace(from, to);
        count++;
      }
    }
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${filePath} with ${count} replacements.`);
}

// 1. Dashboard.tsx
replaceInFile('pages/Dashboard.tsx', [
  [
    `<div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-white via-indigo-100 to-indigo-300 text-black flex items-center justify-center font-black text-xs shadow-lg shadow-white/20">\n              DXA\n            </div>`,
    `<div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-yellow-400 to-cyan-400 shadow-[0_0_18px_rgba(245,158,11,0.4)] flex-shrink-0">\n              <div className="w-full h-full rounded-full overflow-hidden bg-[#07090e] border border-amber-300/40 flex items-center justify-center">\n                <img src="/logo.png" alt="Not Exe" className="w-full h-full object-cover rounded-full" />\n              </div>\n            </div>`
  ],
  [
    `<div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-white via-indigo-100 to-indigo-300 text-black flex items-center justify-center font-black text-xs shadow-lg shadow-white/20">\r\n              DXA\r\n            </div>`,
    `<div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-yellow-400 to-cyan-400 shadow-[0_0_18px_rgba(245,158,11,0.4)] flex-shrink-0">\r\n              <div className="w-full h-full rounded-full overflow-hidden bg-[#07090e] border border-amber-300/40 flex items-center justify-center">\r\n                <img src="/logo.png" alt="Not Exe" className="w-full h-full object-cover rounded-full" />\r\n              </div>\r\n            </div>`
  ],
  [`title: data.title || 'DXA Event'`, `title: data.title || 'Not Exe Event'`],
  [`footer: { text: 'DXA Authentication System' }`, `footer: { text: 'Not Exe Shield Engine' }`],
  [`localStorage.getItem('dxa_onboarding_done')`, `localStorage.getItem('notexe_onboarding_done')`],
  [`localStorage.setItem('dxa_onboarding_done', 'true')`, `localStorage.setItem('notexe_onboarding_done', 'true')`],
  [`['dxa_afk_earnings', 'dxa_last_daily', 'dxa_streak', 'dxa_selected_app']`, `['notexe_afk_earnings', 'notexe_last_daily', 'notexe_streak', 'notexe_selected_app']`],
  [`Welcome to <span className="text-white">DXA Security</span>`, `Welcome to <span className="text-white">Not Exe Shield</span>`],
  [`const prefix = (d.get('prefix') as string || 'DXA').toUpperCase();`, `const prefix = (d.get('prefix') as string || 'NXE').toUpperCase();`],
  [`placeholder="Prefix (DXA)"`, `placeholder="Prefix (NXE)"`],
  [`(prefix || 'DXA')`, `(prefix || 'NXE')`]
]);

// 2. Shop.tsx
replaceInFile('pages/Shop.tsx', [
  [
    `<div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-white via-slate-200 to-[#8B5CF6] text-black font-black flex items-center justify-center text-xs shadow-md">DXA</div>\n            <span className="font-bold text-xs uppercase tracking-widest text-white">Infrastructure Platform</span>`,
    `<div className="relative w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-yellow-400 to-cyan-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex-shrink-0">\n              <div className="w-full h-full rounded-full overflow-hidden bg-[#07090e] border border-amber-300/40 flex items-center justify-center">\n                <img src="/logo.png" alt="Not Exe" className="w-full h-full object-cover rounded-full" />\n              </div>\n            </div>\n            <div className="flex flex-col leading-none">\n              <div className="flex items-center gap-1.5">\n                <span className="font-black text-sm tracking-tight text-white">NOT<span className="text-amber-400 ml-0.5">EXE</span></span>\n                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest bg-amber-400/15 text-amber-300 border border-amber-400/30">SHOP</span>\n              </div>\n            </div>`
  ],
  [
    `<div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-white via-slate-200 to-[#8B5CF6] text-black font-black flex items-center justify-center text-xs shadow-md">DXA</div>\r\n            <span className="font-bold text-xs uppercase tracking-widest text-white">Infrastructure Platform</span>`,
    `<div className="relative w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-yellow-400 to-cyan-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex-shrink-0">\r\n              <div className="w-full h-full rounded-full overflow-hidden bg-[#07090e] border border-amber-300/40 flex items-center justify-center">\r\n                <img src="/logo.png" alt="Not Exe" className="w-full h-full object-cover rounded-full" />\r\n              </div>\r\n            </div>\r\n            <div className="flex flex-col leading-none">\r\n              <div className="flex items-center gap-1.5">\r\n                <span className="font-black text-sm tracking-tight text-white">NOT<span className="text-amber-400 ml-0.5">EXE</span></span>\r\n                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest bg-amber-400/15 text-amber-300 border border-amber-400/30">SHOP</span>\r\n              </div>\r\n            </div>`
  ],
  [`deepxauth@upi`, `notexe@upi`],
  [/DXA-/g, `NXE-`]
]);

// 3. ResellerPortal.tsx
replaceInFile('pages/ResellerPortal.tsx', [
  [`prefix: 'DXA'`, `prefix: 'NXE'`],
  [`(prefix || 'DXA')`, `(prefix || 'NXE')`],
  [`cleanPrefix || 'DXA'`, `cleanPrefix || 'NXE'`],
  [`placeholder="DXA"`, `placeholder="NXE"`],
  [/DXA-/g, `NXE-`]
]);

// 4. Docs.tsx
replaceInFile('Docs.tsx', [
  [
    `<Link to="/" className="flex items-center gap-2.5 group shrink-0">\n                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:rotate-12 transition-all shadow-lg shadow-white/10">\n                            <Shield className="text-black" size={18} />\n                        </div>\n                        <span className="font-black tracking-tight text-lg">DXA <span className="text-muted font-light">Docs</span></span>\n                    </Link>`,
    `<Link to="/" className="flex items-center gap-2.5 group shrink-0">\n                        <div className="relative w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-yellow-400 to-cyan-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex-shrink-0">\n                          <div className="w-full h-full rounded-full overflow-hidden bg-[#07090e] border border-amber-300/40 flex items-center justify-center">\n                            <img src="/logo.png" alt="Not Exe" className="w-full h-full object-cover rounded-full" />\n                          </div>\n                        </div>\n                        <span className="font-black tracking-tight text-lg text-white">NOT<span className="text-amber-400 ml-0.5">EXE</span> <span className="text-slate-400 font-light text-sm">DOCS</span></span>\n                    </Link>`
  ],
  [
    `<Link to="/" className="flex items-center gap-2.5 group shrink-0">\r\n                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:rotate-12 transition-all shadow-lg shadow-white/10">\r\n                            <Shield className="text-black" size={18} />\r\n                        </div>\r\n                        <span className="font-black tracking-tight text-lg">DXA <span className="text-muted font-light">Docs</span></span>\r\n                    </Link>`,
    `<Link to="/" className="flex items-center gap-2.5 group shrink-0">\r\n                        <div className="relative w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-yellow-400 to-cyan-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex-shrink-0">\r\n                          <div className="w-full h-full rounded-full overflow-hidden bg-[#07090e] border border-amber-300/40 flex items-center justify-center">\r\n                            <img src="/logo.png" alt="Not Exe" className="w-full h-full object-cover rounded-full" />\r\n                          </div>\r\n                        </div>\r\n                        <span className="font-black tracking-tight text-lg text-white">NOT<span className="text-amber-400 ml-0.5">EXE</span> <span className="text-slate-400 font-light text-sm">DOCS</span></span>\r\n                    </Link>`
  ],
  [/DXA-/g, `NXE-`],
  [/DXA /g, `Not Exe `],
  [/DXA/g, `Not Exe`]
]);

// 5. Admin.tsx
replaceInFile('pages/Admin.tsx', [
  [`deepxauth@upi`, `notexe@upi`],
  [`dxa_plans_catalog_`, `notexe_plans_catalog_`],
  [/DXA-/g, `NXE-`]
]);

console.log('Rebrand all DXA script finished.');
