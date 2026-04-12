import { TooltipProps } from 'recharts';

export const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/80 p-2 px-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/50 dark:border-gray-700/50 animate-in fade-in zoom-in-95 duration-200">
        {label ? <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">{label}</p> : null}
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center space-x-2 text-sm">
              <span
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: entry.payload?.fillColor || (entry.color && !entry.color.startsWith('url') ? entry.color : (entry.payload?.fill && !entry.payload.fill.startsWith('url') ? entry.payload.fill : '#3b82f6')) }}
              />
              <span className="font-medium text-gray-600 dark:text-gray-300">
                {entry.name}:
              </span>
              <span 
                className="font-bold" 
                style={{ color: entry.payload?.fillColor || (entry.color && !entry.color.startsWith('url') ? entry.color : (entry.payload?.fill && !entry.payload.fill.startsWith('url') ? entry.payload.fill : 'inherit')) }}
              >
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
