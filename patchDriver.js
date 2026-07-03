const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Add apiClient import if not exists
  if (!content.includes("import { apiClient } from '../../api/apiClient';")) {
    content = content.replace(
      "import { Modal } from 'antd';",
      "import { Modal } from 'antd';\nimport { apiClient } from '../../api/apiClient';"
    );
  }

  // Make functions async
  content = content.replace(/const handleStartVnpay = \(\) => {/g, 'const handleStartVnpay = async () => {');
  content = content.replace(/const handleConfirmVnpayPayment = \(\) => {/g, 'const handleConfirmVnpayPayment = async () => {');

  // The replacement logic block
  const replacementBlock = `
      let subType = 'MONTHLY';
      if (selectedPackLabel.includes('Năm') || selectedPackLabel.includes('năm')) {
        subType = 'YEARLY';
      } else if (selectedPackLabel.includes('3 Tháng') || selectedPackLabel.includes('3 tháng') || selectedPackLabel.includes('Quý')) {
        subType = 'QUARTERLY';
      } else if (selectedPackLabel.includes('6 Tháng') || selectedPackLabel.includes('6 tháng') || selectedPackLabel.includes('Nửa')) {
        subType = 'HALF_YEARLY';
      }

      const docPhotos = (window as any).lastUploadedPhotos || {
        registrationPaper: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80',
        identityCard: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80',
        frontPhoto: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80'
      };

      try {
        await apiClient.post('/vip/register', {
          vehicleId: targetVeh ? targetVeh.id : null,
          subscriptionType: subType,
          documentPhotos: JSON.stringify(docPhotos)
        });
      } catch (err) {
        console.error("Lỗi khi đăng ký VIP:", err);
      }`;

  // Replace localStorage logic 1
  const localRegEx1 = /\/\/ Create subscription in localStorage with PENDING_APPROVAL status[\s\S]*?window\.dispatchEvent\(new Event\('storage'\)\);/g;
  content = content.replace(localRegEx1, replacementBlock);

  fs.writeFileSync(filepath, content, 'utf8');
}

patchFile('d:\\\\CodeProject\\\\SWP391\\\\frontend\\\\src\\\\components\\\\driver\\\\DriverPwa.tsx');
patchFile('d:\\\\CodeProject\\\\SWP391\\\\frontend\\\\src\\\\pages\\\\driver\\\\DriverLayout.tsx');

console.log('Patch complete.');
