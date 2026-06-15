import { useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Drawer, Table, Tag } from "antd";
import { Card } from "../common/Card";

export const PersonnelShiftSchedule = ({ data, loading }) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

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

  // Mock data for weekly schedule
  const weeklyColumns = [
    { title: 'Nhân viên', dataIndex: 'name', key: 'name', fixed: 'left', width: 150 },
    { title: 'Thứ 2', dataIndex: 'mon', key: 'mon', render: (text) => <Tag color={text === 'Nghỉ' ? 'default' : 'blue'}>{text}</Tag> },
    { title: 'Thứ 3', dataIndex: 'tue', key: 'tue', render: (text) => <Tag color={text === 'Nghỉ' ? 'default' : 'blue'}>{text}</Tag> },
    { title: 'Thứ 4', dataIndex: 'wed', key: 'wed', render: (text) => <Tag color={text === 'Nghỉ' ? 'default' : 'blue'}>{text}</Tag> },
    { title: 'Thứ 5', dataIndex: 'thu', key: 'thu', render: (text) => <Tag color={text === 'Nghỉ' ? 'default' : 'blue'}>{text}</Tag> },
    { title: 'Thứ 6', dataIndex: 'fri', key: 'fri', render: (text) => <Tag color={text === 'Nghỉ' ? 'default' : 'blue'}>{text}</Tag> },
    { title: 'Thứ 7', dataIndex: 'sat', key: 'sat', render: (text) => <Tag color={text === 'Nghỉ' ? 'default' : 'orange'}>{text}</Tag> },
    { title: 'Chủ Nhật', dataIndex: 'sun', key: 'sun', render: (text) => <Tag color={text === 'Nghỉ' ? 'default' : 'red'}>{text}</Tag> },
  ];

  const weeklyData = [
    { key: 1, name: 'Nguyễn Văn A', mon: 'Ca Sáng', tue: 'Ca Sáng', wed: 'Ca Chiều', thu: 'Nghỉ', fri: 'Ca Sáng', sat: 'Ca Sáng', sun: 'Nghỉ' },
    { key: 2, name: 'Trần Thị B', mon: 'Ca Chiều', tue: 'Ca Chiều', wed: 'Nghỉ', thu: 'Ca Sáng', fri: 'Ca Chiều', sat: 'Nghỉ', sun: 'Ca Sáng' },
    { key: 3, name: 'Lê Văn C', mon: 'Nghỉ', tue: 'Ca Sáng', wed: 'Ca Sáng', thu: 'Ca Chiều', fri: 'Nghỉ', sat: 'Ca Chiều', sun: 'Ca Chiều' },
    { key: 4, name: 'Phạm Minh D', mon: 'Ca Sáng', tue: 'Nghỉ', wed: 'Ca Chiều', thu: 'Ca Sáng', fri: 'Ca Chiều', sat: 'Ca Sáng', sun: 'Nghỉ' },
  ];

  return (
    <>
      <Card className="w-full flex flex-col p-5 bg-white dark:bg-slate-800 border border-[#e9e7e9] dark:border-slate-700 shadow-sm rounded-lg mb-6">
        <div className="w-full flex items-center justify-between mb-4 pb-2">
          <h3 className="text-lg font-bold text-[#041627] dark:text-slate-100">
            Phân ca hôm nay (14/11)
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
                      ) : null}
                      {shift.morning}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-[#475569] dark:text-slate-400 text-center">
                    <span className="flex items-center justify-center gap-1.5">
                      {shift.afternoon !== 'Trống ca' ? (
                         <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      ) : null}
                      {shift.afternoon}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Drawer
        title="Lịch trực chi tiết tuần (13/11 - 19/11)"
        placement="right"
        width={800}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        <Table 
          columns={weeklyColumns} 
          dataSource={weeklyData} 
          pagination={false}
          scroll={{ x: 700 }}
          bordered
          size="middle"
        />
      </Drawer>
    </>
  );
};
