const fs = require('fs');
let file = 'frontend/src/pages/driver/DriverLayout.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. qr generate
const qrMatch = `      const response = await fetch('/api/v1/driver/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${accessToken || (sessionStorage.getItem('token') || localStorage.getItem('token'))}\`
        },
        body: JSON.stringify({
          vehicleId: vehicleId,
          purpose: direction === 'VÀO' ? 'CHECK_IN' : 'CHECK_OUT'
        })
      });
      if (response.ok) {
        const data = await response.json();`;
const qrReplace = `      const response = await apiClient.post('/v1/driver/qr/generate', {
        vehicleId: vehicleId,
        purpose: direction === 'VÀO' ? 'CHECK_IN' : 'CHECK_OUT'
      });
      const data = response.data;
      if (true) {`;
content = content.replace(qrMatch, qrReplace);

// 2. vehicles get
const vehGetMatch = `      const response = await fetch('/api/vehicles', {
        headers: { 'Authorization': \`Bearer \${accessToken || (sessionStorage.getItem('token') || localStorage.getItem('token'))}\` }
      });
      const data = await response.json();`;
const vehGetReplace = `      const response = await apiClient.get('/vehicles');
      const data = response.data;`;
content = content.replace(vehGetMatch, vehGetReplace);

// 3. logs get
const logsGetMatch = `        const response = await fetch('/api/logs', {
          headers: { 'Authorization': \`Bearer \${(sessionStorage.getItem('token') || localStorage.getItem('token'))}\` }
        });
        if (response.ok) {
          const data = await response.json();`;
const logsGetReplace = `        const response = await apiClient.get('/logs');
        const data = response.data;
        if (true) {`;
content = content.replace(logsGetMatch, logsGetReplace);

// 4. vehicles post
const vehPostMatch = `      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${accessToken || (sessionStorage.getItem('token') || localStorage.getItem('token'))}\`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errMsg = 'Thêm xe thất bại. Biển số xe có thể đã tồn tại!';
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errMsg = errData.message;
          }
        } catch (e) {}
        throw new Error(errMsg);
      }

      const savedVehicle = await response.json();`;
const vehPostReplace = `      const response = await apiClient.post('/vehicles', payload);
      const savedVehicle = response.data;`;
content = content.replace(vehPostMatch, vehPostReplace);

// 5. vehicles put
const vehPutMatch = `      const response = await fetch(\`/api/vehicles/\${editingVehicleId}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${accessToken || (sessionStorage.getItem('token') || localStorage.getItem('token'))}\`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedVehicle = await response.json();`;
const vehPutReplace = `      const response = await apiClient.put(\`/vehicles/\${editingVehicleId}\`, payload);
      const savedVehicle = response.data;
      if (true) {`;
content = content.replace(vehPutMatch, vehPutReplace);

const vehPutElseMatch = `      } else {
        let errMsg = 'Không thể cập nhật phương tiện. Vui lòng thử lại!';
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errMsg = errData.message;
          }
        } catch (e) {}
        triggerToast(errMsg, 'error');
      }`;
const vehPutElseReplace = `      }`;
content = content.replace(vehPutElseMatch, vehPutElseReplace);

// 6. vehicles lock 1
const lock1Match = `      const response = await fetch('/api/vehicles/lock', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${accessToken || (sessionStorage.getItem('token') || localStorage.getItem('token'))}\`
        },
        body: JSON.stringify({ plate: plate, isLocked: nextState })
      });
      const data = await response.json();`;
const lock1Replace = `      const response = await apiClient.post('/vehicles/lock', { plate: plate, isLocked: nextState });
      const data = response.data;`;
content = content.replace(lock1Match, lock1Replace);

// 7. vehicles lock 2
const lock2Match = `      const response = await fetch('/api/vehicles/lock', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${accessToken || (sessionStorage.getItem('token') || localStorage.getItem('token'))}\`
        },
        body: JSON.stringify({ plate: plateStr, isLocked: !currentIsLocked })
      });
      const data = await response.json();`;
const lock2Replace = `      const response = await apiClient.post('/vehicles/lock', { plate: plateStr, isLocked: !currentIsLocked });
      const data = response.data;`;
content = content.replace(lock2Match, lock2Replace);

fs.writeFileSync(file, content, 'utf8');
console.log('Done!');
