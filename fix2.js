const fs = require('fs');
const files = [
  'frontend/src/pages/admin/AdminDashboard.tsx',
  'frontend/src/pages/admin/ViolationManagerPanel.tsx',
  'frontend/src/pages/admin/VipApprovalPanel.tsx',
  'frontend/src/pages/driver/DriverLayout.tsx',
  'frontend/src/pages/staff/StaffDashboard.jsx',
  'frontend/src/pages/staff/StaffPayment.jsx'
];
for (let file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let orig = content;
    content = content.replace(/apiClient\.(get|post|put|delete)\(['"]\/api\//g, "apiClient.$1('/");
    content = content.replace(/apiClient\.(get|post|put|delete)\(\`\/api\//g, "apiClient.$1(`/");
    if (content !== orig) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed', file);
    }
  } catch(e) {
    console.error(e.message);
  }
}
