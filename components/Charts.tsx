
import React from 'react';

interface ChartProps {
  data: { label: string; value: number; color: string }[];
}

// --- Donut Chart ---
export const DonutChart: React.FC<ChartProps> = ({ data }) => {
  return <CircularChart data={data} type="donut" />;
};

// --- Pie Chart ---
export const PieChart: React.FC<ChartProps> = ({ data }) => {
  return <CircularChart data={data} type="pie" />;
};

// --- Shared Circular Chart Logic ---
const CircularChart: React.FC<ChartProps & { type: 'donut' | 'pie' }> = ({ data, type }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativeAngle = 0;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 w-full text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 h-full">
      <div className="relative w-48 h-48 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {data.map((slice, i) => {
            const percentage = slice.value / total;
            const angle = percentage * 360;
            // If there's only one slice, make it a full circle to avoid arc artifacts
            if (percentage === 1) {
                return (
                    <circle key={i} cx="50" cy="50" r="40" fill={slice.color} />
                );
            }
            
            const largeArcFlag = percentage > 0.5 ? 1 : 0;
            const r = 40; // radius
            const cx = 50;
            const cy = 50;

            // Calculate coordinates
            const startX = cx + r * Math.cos((Math.PI * cumulativeAngle) / 180);
            const startY = cy + r * Math.sin((Math.PI * cumulativeAngle) / 180);
            
            const endAngle = cumulativeAngle + angle;
            const endX = cx + r * Math.cos((Math.PI * endAngle) / 180);
            const endY = cy + r * Math.sin((Math.PI * endAngle) / 180);

            const pathData = [
              `M ${cx} ${cy}`,
              `L ${startX} ${startY}`,
              `A ${r} ${r} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              'Z'
            ].join(' ');

            cumulativeAngle += angle;

            return (
              <path
                key={i}
                d={pathData}
                fill={slice.color}
                className="hover:opacity-90 transition-opacity cursor-pointer stroke-white stroke-[0.5]"
              >
                <title>{`${slice.label}: $${slice.value.toLocaleString()} (${Math.round(percentage * 100)}%)`}</title>
              </path>
            );
          })}
          {/* Inner Circle for Donut Effect */}
          {type === 'donut' && <circle cx="50" cy="50" r="25" fill="white" />}
        </svg>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
            <span className="text-gray-600 truncate max-w-[100px]">{d.label}</span>
            <span className="font-semibold text-gray-900 ml-auto">{Math.round((d.value/total)*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Bar Chart ---
export const BarChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 w-full text-gray-400 text-sm">
        No transaction history
      </div>
    );
  }

  return (
    <div className="flex items-end justify-between h-64 gap-1 pt-8 pb-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
          <div className="relative w-full flex justify-center h-full items-end">
             {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-sm">
              <div className="font-semibold mb-0.5">{d.label}</div>
              <div>${d.value.toLocaleString()}</div>
            </div>
            
            <div 
              style={{ height: `${(d.value / max) * 100}%`, backgroundColor: d.color }} 
              className="w-full rounded-t-sm transition-all duration-500 opacity-80 group-hover:opacity-100 min-h-[4px]"
            ></div>
          </div>
          {/* Label logic: For dense data (like 30 days), show every 5th label to avoid clutter */}
          <span className="text-[10px] text-gray-500 mt-2 truncate w-full text-center h-4">
             {data.length > 15 ? (i % 5 === 0 || i === data.length - 1 ? d.label : '') : d.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// --- Line Chart (Simulated Area) ---
export const AreaChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    if (data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const height = 100;
    const width = 300;
    
    // Create points
    const points = data.map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible preserve-3d">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
                vectorEffect="non-scaling-stroke"
            />
            <path
                d={`M 0,${height} ${points} L ${width},${height} Z`}
                fill={color}
                fillOpacity="0.1"
            />
        </svg>
    );
}
