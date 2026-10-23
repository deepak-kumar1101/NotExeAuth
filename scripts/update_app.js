import fs from 'fs';
import path from 'path';

const appPath = path.resolve('deepXauth', 'App.tsx');
let app = fs.readFileSync(appPath, 'utf8');

app = app.replace(
  /useEffect\(\(\) => \{\s*const unsubscribeAuth = onAuthStateChanged\(auth, \(u\) => \{[\s\S]*?return \(\) => \{\s*unsubscribeAuth\(\);\s*unsubscribeMaintenance\(\);\s*\};\s*\}, \[\]\);/,
  `useEffect(() => {
    // Safety fallback: ensure initial loading resolves quickly even if Firebase is connecting
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      clearTimeout(timer);
      if (u?.email === 'reseller@gmail.com') {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(u);
      setLoading(false);
    }, (err) => {
      clearTimeout(timer);
      console.warn("Auth state listener error:", err);
      setLoading(false);
    });

    const maintenanceRef = ref(db, 'system/config');
    const unsubscribeMaintenance = onValue(maintenanceRef, (snapshot) => {
      setMaintenance(snapshot.val());
    }, (err) => {
      console.warn("Maintenance listener error:", err);
    });

    return () => {
      clearTimeout(timer);
      unsubscribeAuth();
      unsubscribeMaintenance();
    };
  }, []);`
);

fs.writeFileSync(appPath, app, 'utf8');
console.log('✓ Updated App.tsx');
