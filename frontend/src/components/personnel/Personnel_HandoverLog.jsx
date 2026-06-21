import { useState } from "react";
import { SwapRightOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Modal, notification } from "antd";
import { Card } from "../common/Card";

export const PersonnelHandoverLog = ({ data, loading }) => {
  const [isSigned, setIsSigned] = useState(false);

  if (loading) {
    return (
      <Card className="w-full flex-1">
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-[#1677ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  const handleSignOff = () => {
    Modal.confirm({
      title: 'Xác nhận tiếp nhận ca trực?',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn xác nhận đã kiểm tra đầy đủ các ghi chú bàn giao và tình trạng tài sản tại chốt trực.',
      okText: 'Ký nhận ngay',
      cancelText: 'Hủy',
      onOk() {
        return new Promise((resolve) => {
          setTimeout(() => {
            setIsSigned(true);
            notification.success({
              message: 'Ký nhận ca thành công',
              description: 'Bạn đã tiếp nhận ca trực. Chúc bạn một ca làm việc hiệu quả!',
              placement: 'topRight',
            });
            resolve();
          }, 800);
        });
      },
    });
  };

  return (
    <Card className="w-full flex flex-col p-5 bg-white dark:bg-slate-800 border border-[#e9e7e9] dark:border-slate-700 shadow-sm rounded-lg flex-1">
      <div className="w-full flex items-center justify-between mb-4 border-b border-[#e9e7e9] dark:border-slate-700 pb-3">
        <h3 className="text-lg font-bold text-[#041627] dark:text-slate-100 flex items-center gap-2">
          <span className="text-[#1677ff]">📋</span> Bàn giao ca gần nhất
        </h3>
        <span className="text-xs text-[#64748b] dark:text-slate-400 font-medium">
          {data.time}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {/* Handover Direction */}
        <div className="flex items-center justify-between bg-[#f8fafc] dark:bg-slate-900 p-3 rounded-lg border border-[#e2e8f0] dark:border-slate-700">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-[#64748b] dark:text-slate-400 font-bold mb-1 tracking-wider">Người giao ({data.from.shift})</span>
            <span className="text-sm font-semibold text-[#334155] dark:text-slate-200">{data.from.name}</span>
          </div>
          <div className="px-4 text-[#94a3b8] dark:text-slate-500">
            <SwapRightOutlined className="text-xl" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase text-[#64748b] dark:text-slate-400 font-bold mb-1 tracking-wider">Người nhận ({data.to.shift})</span>
            <span className="text-sm font-semibold text-[#334155] dark:text-slate-200">{data.to.name}</span>
          </div>
        </div>

        {/* Handover Notes */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#64748b] dark:text-slate-400 mb-2 uppercase tracking-wider">Ghi chú bàn giao:</span>
          <ul className="flex flex-col gap-2 pl-1">
            {data.notes.map((note, index) => (
              <li key={index} className="text-sm text-[#475569] dark:text-slate-300 flex items-start gap-2">
                <span className="text-[#94a3b8] dark:text-slate-500 mt-1">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Signatures */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-dashed border-[#cbd5e1] dark:border-slate-600">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 text-xs font-medium mb-1">
              <CheckCircleOutlined /> Đã ký bàn giao
            </div>
            <span className="text-[10px] text-[#94a3b8] dark:text-slate-500 font-mono tracking-wider">ID: {data.from.id}</span>
          </div>
          <div className="flex flex-col items-center">
            {isSigned ? (
              <>
                <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 text-xs font-medium mb-1">
                  <CheckCircleOutlined /> Đã tiếp nhận
                </div>
                <span className="text-[10px] text-[#94a3b8] dark:text-slate-500 font-mono tracking-wider">ID: {data.to.id}</span>
              </>
            ) : (
              <button 
                onClick={handleSignOff}
                className="px-4 py-1.5 bg-[#1677ff] hover:bg-[#0058be] text-white text-xs font-bold rounded shadow-sm transition-colors"
              >
                Ký nhận ca
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
