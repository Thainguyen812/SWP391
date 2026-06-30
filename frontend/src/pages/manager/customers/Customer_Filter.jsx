import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

export const CustomerFilter = ({ filter, setFilter, onSearch }) => {
  return (
    <div className="flex justify-between items-center w-full py-4">
      {/* Search and Filter */}
      <div className="flex items-center gap-3">
        <div className="relative w-80">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm tên, biển số, mã thẻ..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors text-gray-700 dark:text-gray-300">
          <FilterOutlined />
          Bộ lọc
        </button>
      </div>

      {/* Segmented Controls */}
      <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
        {['all', 'month', 'vip', 'pending'].map((type) => {
          const labels = {
            'all': 'Tất cả',
            'month': 'Tháng',
            'vip': 'VIP',
            'pending': 'Chờ duyệt VIP'
          };
          
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                filter === type 
                  ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {labels[type]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
