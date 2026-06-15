const fs = require('fs');
const files = [
  'frontend/src/components/dashboard/Dashboard_RevenueChart.jsx',
  'frontend/src/components/dashboard/Dashboard_SystemNotifications.jsx',
  'frontend/src/components/dashboard/Dashboard_TopEmployees.jsx',
  'frontend/src/components/dashboard/Dashboard_VehicleDistribution.jsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/"\.\.\/\.\.\/common\//g, '"../common/');
  content = content.replace(/"\.\.\/\.\.\/\.\.\/assets\//g, '"../../assets/');
  fs.writeFileSync(f, content);
});
console.log('Fixed dashboard imports');
