import React, { useState, useEffect } from 'react';
import { logService } from '../../../services/logService';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ShieldAlert 
} from 'lucide-react';

export const LogsMain = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [eventType, setEventType] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await logService.getSystemLogs({
        page,
        limit,
        keyword,
        eventType
      });
      if (response && response.data) {
        setLogs(response.data);
        setTotal(response.total || response.data.length);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, eventType]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleExport = async () => {
    try {
      const res = await logService.exportLogs({ keyword, eventType });
      if (res && res.fileUrl) {
        alert('Xuất báo cáo thành công! Tải xuống: ' + res.fileUrl);
      }
    } catch (error) {
      alert('Lỗi xuất báo cáo');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error':
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getEventTypeBadge = (type) => {
    const badges = {
      SECURITY: 'bg-red-100 text-red-800 border-red-200',
      SYSTEM: 'bg-blue-100 text-blue-800 border-blue-200',
      AUTH: 'bg-purple-100 text-purple-800 border-purple-200',
      CONFIG: 'bg-amber-100 text-amber-800 border-amber-200'
    };
    return badges[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" />
            Nhật ký hệ thống
          </h1>
          <p className="text-gray-500 text-sm">Ghi nhận toàn bộ hoạt động, lỗi hệ thống và thao tác của quản trị viên.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Tìm kiếm hành động, tài khoản..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          <button type="submit" className="hidden">Tìm</button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-1">
            <Filter className="w-4 h-4 text-gray-500" />
            Loại sự kiện:
          </span>
          <select
            value={eventType}
            onChange={(e) => {
              setEventType(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tất cả loại sự kiện</option>
            <option value="SECURITY">An ninh (SECURITY)</option>
            <option value="SYSTEM">Hệ thống (SYSTEM)</option>
            <option value="AUTH">Xác thực (AUTH)</option>
            <option value="CONFIG">Cấu hình (CONFIG)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-gray-500 text-sm">Đang tải nhật ký sự kiện...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mb-2" />
            <p>Không tìm thấy nhật ký hoạt động nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Loại</th>
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Hành động / Nội dung</th>
                  <th className="px-6 py-4">Vị trí</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getEventTypeBadge(log.eventType)}`}>
                        {log.eventType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{log.user}</div>
                      <div className="text-xs text-gray-400">{log.role}</div>
                    </td>
                    <td className="px-6 py-4 font-normal max-w-xs md:max-w-md truncate">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {log.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center flex justify-center">
                      {getStatusIcon(log.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Hiển thị {logs.length} trên tổng số {total} dòng nhật ký
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
