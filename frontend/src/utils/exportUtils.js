export const exportToCSV = (data, filename, columnMapping = null) => {
  try {
    if (!data || !data.length) {
      alert("Không có dữ liệu để xuất báo cáo!");
      return;
    }

    // Determine headers
    let keys = [];
    let headers = [];
    
    if (columnMapping) {
      keys = Object.keys(columnMapping);
      headers = Object.values(columnMapping);
    } else {
      keys = Object.keys(data[0]).filter(k => data[0] && typeof data[0][k] !== 'object');
      headers = [...keys];
    }

    const csvContent = [
      headers.join(','),
      ...data.map(item => 
        keys.map(k => {
          let val = item ? item[k] : '';
          if (val === null || val === undefined) val = '';
          // Escape quotes
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    // Add BOM for UTF-8 Excel support
    const blob = new Blob(["\ufeff" + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename || 'bao_cao.csv');
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("Lỗi khi xuất báo cáo:", error);
    alert("Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử lại.");
  }
};
