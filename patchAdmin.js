const fs = require('fs');

function patchVipPanel(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Add apiClient import if not exists
  if (!content.includes("import { apiClient }")) {
    content = content.replace(
      "import { \n  Check,",
      "import { apiClient } from '../../api/apiClient';\nimport { \n  Check,"
    );
  }

  // Replace loadSubscriptions
  const loadSubBlock = `const loadSubscriptions = async () => {
    try {
      const res = await apiClient.get('/v1/vip/pending');
      setSubscriptions(res.data);
    } catch (err) {
      console.error("Failed to load VIP subscriptions from API:", err);
      setSubscriptions([]);
    }
  };`;
  
  // replace the specific string
  const oldLoadSub = `const loadSubscriptions = () => {
    const saved = localStorage.getItem('urbanpark_vip_subscriptions');
    if (saved) {
      try {
        setSubscriptions(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse VIP subscriptions:", err);
      }
    } else {
      // Seed a few initial mock ones if empty, some in pending
      const initialSubs: VipSubscription[] = [
        {
          id: 'VIP-9991',
          vehicle_plate: '30F-999.78',
          type: 'Cước Vàng Tháng Gold',
          startDate: '13/06/2026',
          endDate: '13/07/2026',
          status: 'PENDING',
          document_photos: {
            registrationPaper: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80',
            identityCard: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80',
            frontPhoto: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80'
          },
          approved_by: null
        }
      ];
      localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify(initialSubs));
      setSubscriptions(initialSubs);
    }
  };`;

  content = content.replace(oldLoadSub, loadSubBlock);

  // Replace handleAction signature
  content = content.replace(
    /const handleAction = \(id: string, nextStatus: 'ACTIVE' \| 'REJECTED'\) => {/,
    "const handleAction = async (id: string, nextStatus: 'ACTIVE' | 'REJECTED') => {"
  );

  // Replace the part inside handleAction
  const actionAPI = `
    let targetSub = subscriptions.find(s => s.id === id);
    if (!targetSub) return;

    try {
      if (nextStatus === 'ACTIVE') {
        await apiClient.post(\`/v1/vip/\${id}/approve\`);
        triggerToast('Phê duyệt hồ sơ VIP thành công!', 'success');
      } else {
        await apiClient.post(\`/v1/vip/\${id}/reject\`, { reason: 'Từ chối (OCR)' });
        triggerToast('Đã từ chối hồ sơ VIP!', 'success');
      }
      loadSubscriptions(); // Refresh from backend
    } catch (err) {
      triggerToast('Có lỗi xảy ra khi gọi API!', 'error');
    }
  `;
  
  // Replace from `let targetSub` down to `localStorage.setItem('urbanpark_vip_subscriptions', JSON.stringify(updated));`
  const actionRegEx = /let targetSub = subscriptions\.find[\s\S]*?localStorage\.setItem\('urbanpark_vip_subscriptions', JSON\.stringify\(updated\)\);/g;
  content = content.replace(actionRegEx, actionAPI);

  fs.writeFileSync(filepath, content, 'utf8');
}

patchVipPanel('d:\\\\CodeProject\\\\SWP391\\\\frontend\\\\src\\\\pages\\\\admin\\\\VipApprovalPanel.tsx');

console.log('Patch complete.');
