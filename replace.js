const fs = require('fs');
let file = 'frontend/src/pages/driver/DriverLayout.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. qr generate
content = content.replace(
  /const response = await fetch\('\/api\/v1\/driver\/qr\/generate', \{\s*method: 'POST',\s*headers: \{\s*'Content-Type': 'application\/json',\s*'Authorization': [^\}]+\},\s*body: JSON\.stringify\(\{\s*vehicleId: vehicleId,\s*purpose: direction === 'VÀO' \? 'CHECK_IN' : 'CHECK_OUT'\s*\}\)\s*\}\);\s*if \(response\.ok\) \{\s*const data = await response\.json\(\);/g,
  "const response = await apiClient.post('/v1/driver/qr/generate', { vehicleId: vehicleId, purpose: direction === 'VÀO' ? 'CHECK_IN' : 'CHECK_OUT' }); const data = response.data; if (true) {"
);

// 2. vehicles get
content = content.replace(
  /const response = await fetch\('\/api\/vehicles', \{\s*headers: \{ 'Authorization': [^\}]+\}\s*\}\);\s*const data = await response\.json\(\);/g,
  "const response = await apiClient.get('/vehicles'); const data = response.data;"
);

// 3. logs get
content = content.replace(
  /const response = await fetch\('\/api\/logs', \{\s*headers: \{ 'Authorization': [^\}]+\}\s*\}\);\s*if \(response\.ok\) \{\s*const data = await response\.json\(\);/g,
  "const response = await apiClient.get('/logs'); const data = response.data; if (true) {"
);

// 4. vehicles post
content = content.replace(
  /const response = await fetch\('\/api\/vehicles', \{\s*method: 'POST',\s*headers: \{[^\}]+\},\s*body: JSON\.stringify\(payload\)\s*\}\);\s*if \(!response\.ok\) \{[\s\S]*?throw new Error\(errMsg\);\s*\}\s*const savedVehicle = await response\.json\(\);/g,
  "const response = await apiClient.post('/vehicles', payload); const savedVehicle = response.data;"
);

// 5. vehicles put
content = content.replace(
  /const response = await fetch\(`\/api\/vehicles\/\$\{editingVehicleId\}`,\s*\{\s*method: 'PUT',\s*headers: \{[^\}]+\},\s*body: JSON\.stringify\(payload\)\s*\}\);\s*if \(response\.ok\) \{\s*const savedVehicle = await response\.json\(\);/g,
  "const response = await apiClient.put(`/vehicles/${editingVehicleId}`, payload); if (true) { const savedVehicle = response.data;"
);
// replace else block for put
content = content.replace(
  /\} else \{\s*let errMsg = 'Không thể cập nhật phương tiện\. Vui lòng thử lại!';\s*try \{\s*const errData = await response\.json\(\);\s*if \(errData && errData\.message\) \{\s*errMsg = errData\.message;\s*\}\s*\} catch \(e\) \{\}\s*triggerToast\(errMsg, 'error'\);\s*\}/g,
  "} else {}"
);

// 6 & 7. vehicles lock (two identical fetch calls)
content = content.replace(
  /const response = await fetch\('\/api\/vehicles\/lock', \{\s*method: 'POST',\s*headers: \{[^\}]+\},\s*body: JSON\.stringify\(\{\s*plate: ([a-zA-Z]+),\s*isLocked: ([^\}]+)\s*\}\)\s*\}\);\s*const data = await response\.json\(\);/g,
  "const response = await apiClient.post('/vehicles/lock', { plate: $1, isLocked: $2 }); const data = response.data;"
);

fs.writeFileSync(file, content, 'utf8');
console.log('DriverLayout fixed manually!');
