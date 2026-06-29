import { HistoryOutlined, CheckCircleFilled, WarningFilled, InfoCircleFilled } from "@ant-design/icons";

export const SecurityLogs = ({ data = [] }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircleFilled className="text-emerald-500 text-sm" />;
      case 'warning': return <WarningFilled className="text-red-500 text-sm" />;
      default: return <InfoCircleFilled className="text-blue-500 text-sm" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-slate-100 flex items-center gap-2">
        <HistoryOutlined className="text-slate-500 text-lg" />
        <h2 className="text-base font-bold text-slate-800">Nhật ký Gần đây</h2>
      </div>

      <div className="p-6 flex-1">
        <div className="relative pl-3 border-l-2 border-slate-100 space-y-6">
          {data.map((log) => (
            <div key={log.id} className="relative">
              <div className="absolute -left-[23px] top-1 bg-white rounded-full p-0.5">
                {getIcon(log.type)}
              </div>
              <div>
                <p className="text-sm text-slate-700 leading-snug">{log.content}</p>
                <span className="text-xs text-slate-400 mt-1 block">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
