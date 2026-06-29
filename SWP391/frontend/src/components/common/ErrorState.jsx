import { DisconnectOutlined, ReloadOutlined } from "@ant-design/icons";

export const ErrorState = ({ title = "Mất kết nối máy chủ", message = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại Backend hoặc bật Mock API.", onRetry }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#f8fafc] dark:bg-slate-900 transition-colors p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-[#e9e7e9] dark:border-slate-700 p-10 flex flex-col items-center text-center transition-colors">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">
          <DisconnectOutlined />
        </div>
        <h2 className="text-xl font-bold text-[#041627] dark:text-slate-100 mb-3">{title}</h2>
        <p className="text-sm text-[#64748b] dark:text-slate-400 mb-8 leading-relaxed">
          {message}
        </p>
        {onRetry ? (
          <button 
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1677ff] hover:bg-[#0058be] text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <ReloadOutlined />
            Thử lại ngay
          </button>
        ) : (
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1677ff] hover:bg-[#0058be] text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <ReloadOutlined />
            Tải lại trang
          </button>
        )}
      </div>
    </div>
  );
};
