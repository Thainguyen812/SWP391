import { Card, CardHeader, CardBody } from '../../common/Card';
import icon9 from '../../../assets/icons/icon-9.svg';
import vector from '../../../assets/icons/vector.svg';

const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const revenueAxisLabels = ["60M", "40M", "20M", "0M"];

export const RevenueChart = () => {
  return (
    <Card className="col-span-2" noPadding>
      <CardHeader 
        title="Doanh thu 7 ngày qua" 
        action={
          <button type="button" className="p-1 hover:bg-gray-100 rounded">
            <img className="w-1 h-4" alt="options" src={icon9} />
          </button>
        } 
      />
      <CardBody>
        <div className="relative self-stretch w-full h-[302px]">
          <div className="flex flex-col w-[calc(100%_-_32px)] h-[calc(100%_-_32px)] items-center justify-end absolute top-4 left-4 opacity-70">
            <div className="relative w-full max-w-[608.66px] h-[270px]">
              <img className="absolute w-full h-full top-0 left-0" alt="chart line" src={vector} />
            </div>
          </div>
          <div className="inline-flex flex-col h-[calc(100%_-_48px)] items-start justify-between absolute top-4 left-4">
            {revenueAxisLabels.map((label) => (
              <div key={label} className="text-caption-strong text-[#74777d]">
                {label}
              </div>
            ))}
          </div>
          <div className="flex w-[calc(100%_-_64px)] items-start justify-between absolute left-12 bottom-2">
            {weekdays.map((day) => (
              <div key={day} className="text-caption-strong text-[#74777d]">
                {day}
              </div>
            ))}
          </div>
          <div className="flex flex-col w-[calc(100%_-_64px)] h-[calc(100%_-_48px)] items-start justify-between absolute top-4 left-12">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`dashed-line-${index}`} className="w-full h-px border-b border-dashed border-[#e9e7e9]" />
            ))}
            <div className="w-full h-px border-b border-solid border-[#c4c6cd]" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
