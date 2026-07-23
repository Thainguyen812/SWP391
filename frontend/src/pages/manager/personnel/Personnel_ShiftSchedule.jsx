import { useState, useEffect } from "react";
import { ArrowRightOutlined, SaveOutlined } from "@ant-design/icons";
import { Drawer, Table, Tag, Select, notification } from "antd";
import { Card } from '../../../components/common/Card';
import { personnelService } from '../../../services/personnelService';

const SHIFT_OPTIONS = [
  { label: 'Ca Sáng', value: 'Ca Sáng' },
  { label: 'Ca Chiều', value: 'Ca Chiều' },
  { label: 'Ca Đêm', value: 'Ca Đêm' },
  { label: 'Nghỉ', value: 'Nghỉ' },
  { label: 'Chưa phân ca', value: 'Chưa phân ca' }
];

export const PersonnelShiftSchedule = ({ data, loading, employees, onUpdateSuccess }) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isDrawerVisible) {
      fetchWeeklyData();
    }
  }, [isDrawerVisible]);

  const fetchWeeklyData = async () => {
    setWeeklyLoading(true);
    try {
      const res = await personnelService.getWeeklyShifts();
      setWeeklyData(res);
    } catch (err) {
      console.error(err);
      notification.error({ message: 'Lỗi tải lịch trực tuần' });
    } finally {
      setWeeklyLoading(false);
    }
  };

  const handleShiftChange = (userId, day, value) => {
    setWeeklyData(prev => prev.map(item => 
      item.key === userId ? { ...item, [day]: value } : item
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = weeklyData.map(item => ({
        ...item,
        userId: item.key
      }));
      await personnelService.updateWeeklyShifts(payload);
      notification.success({ message: 'Lưu lịch tuần thành công' });
      setIsDrawerVisible(false);
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      console.error(err);
      notification.error({ message: 'Không thể lưu lịch tuần' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full flex-1">
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-[#1677ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) return null;

  const renderSelect = (text, record, day) => (
    <Select
      value={text}
      size="small"
      style={{ width: 110 }}
      onChange={(val) => handleShiftChange(record.key, day, val)}
      options={SHIFT_OPTIONS}
      bordered={false}
      className={`rounded ${text === 'Nghỉ' ? 'bg-gray-100' : text === 'Chưa phân ca' ? 'bg-red-50' : 'bg-blue-50'}`}
    />
  );

  const weeklyColumns = [
    { title: 'Nhân viên', dataIndex: 'name', key: 'name', fixed: 'left', width: 150 },
    { title: 'Thứ 2', dataIndex: 'mon', key: 'mon', render: (t, r) => renderSelect(t, r, 'mon') },
    { title: 'Thứ 3', dataIndex: 'tue', key: 'tue', render: (t, r) => renderSelect(t, r, 'tue') },
    { title: 'Thứ 4', dataIndex: 'wed', key: 'wed', render: (t, r) => renderSelect(t, r, 'wed') },
    { title: 'Thứ 5', dataIndex: 'thu', key: 'thu', render: (t, r) => renderSelect(t, r, 'thu') },
    { title: 'Thứ 6', dataIndex: 'fri', key: 'fri', render: (t, r) => renderSelect(t, r, 'fri') },
    { title: 'Thứ 7', dataIndex: 'sat', key: 'sat', render: (t, r) => renderSelect(t, r, 'sat') },
    { title: 'Chủ Nhật', dataIndex: 'sun', key: 'sun', render: (t, r) => renderSelect(t, r, 'sun') },
  ];

  return (
    <>
      <Card className="w-full flex flex-col p-5 bg-white dark:bg-slate-800 border border-[#e9e7e9] dark:border-slate-700 shadow-sm rounded-lg mb-6">
        <div className="w-full flex items-center justify-between mb-4 pb-2">
          <h3 className="text-lg font-bold text-[#041627] dark:text-slate-100">
            Phân ca hôm nay
          </h3>
          <button 
            onClick={() => setIsDrawerVisible(true)}
            className="text-sm font-medium text-[#1677ff] hover:text-[#0058be] flex items-center gap-1 transition-colors focus:outline-none"
          >
            Chi tiết tuần <ArrowRightOutlined className="text-xs" />
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e9e7e9] dark:border-slate-700">
                <th className="py-2 px-2 text-xs font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider">Trạm / Cổng</th>
                <th className="py-2 px-2 text-xs font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider text-center">
                  <div className="flex flex-col">
                    <span>Ca Sáng</span>
                    <span className="text-[10px] font-normal">06:00-14:00</span>
                  </div>
                </th>
                <th className="py-2 px-2 text-xs font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider text-center">
                  <div className="flex flex-col">
                    <span>Ca Chiều</span>
                    <span className="text-[10px] font-normal">14:00-22:00</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((shift, index) => (
                <tr key={index} className="border-b border-[#f1f5f9] dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-2 text-sm font-semibold text-[#334155] dark:text-slate-300">
                    {shift.location}
                  </td>
                  <td className="py-3 px-2 text-sm text-[#475569] dark:text-slate-400 text-center">
                    <span className="flex items-center justify-center gap-1.5">
                      {shift.morning !== 'Trống ca' ? (
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      ) : (
                         <Tag color="error">Trống</Tag>
                      )}
                      {shift.morning !== 'Trống ca' ? shift.morning : null}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-[#475569] dark:text-slate-400 text-center">
                    <span className="flex items-center justify-center gap-1.5">
                      {shift.afternoon !== 'Trống ca' ? (
                         <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      ) : (
                         <Tag color="error">Trống</Tag>
                      )}
                      {shift.afternoon !== 'Trống ca' ? shift.afternoon : null}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span>Lịch trực chi tiết tuần</span>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-2 mr-6"
            >
              <SaveOutlined /> {saving ? 'Đang lưu...' : 'Lưu lịch'}
            </button>
          </div>
        }
        placement="right"
        width={950}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        <Table 
          columns={weeklyColumns} 
          dataSource={weeklyData} 
          pagination={false}
          scroll={{ x: 800 }}
          bordered
          size="middle"
          loading={weeklyLoading}
        />
      </Drawer>
    </>
  );
};
