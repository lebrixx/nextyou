import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimePickerWheelProps {
  value?: string; // "HH:MM"
  onChange: (value: string) => void;
  minuteStep?: number;
}

const pad = (n: number) => n.toString().padStart(2, '0');

const TimePickerWheel: React.FC<TimePickerWheelProps> = ({ value, onChange, minuteStep = 5 }) => {
  const [h, m] = useMemo(() => {
    if (!value) return ['08', '00'];
    const [hh, mm] = value.split(':');
    return [pad(parseInt(hh || '0')), pad(parseInt(mm || '0'))];
  }, [value]);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => pad(i)), []);
  const minutes = useMemo(() => Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => pad(i * minuteStep)), [minuteStep]);

  const handleHour = (hour: string) => onChange(`${hour}:${m}`);
  const handleMinute = (minute: string) => onChange(`${h}:${minute}`);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Select value={h} onValueChange={handleHour}>
        <SelectTrigger className="glass border-white/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="glass-strong max-h-64 overflow-auto">
          {hours.map((hour) => (
            <SelectItem key={hour} value={hour}>{hour}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={m} onValueChange={handleMinute}>
        <SelectTrigger className="glass border-white/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="glass-strong max-h-64 overflow-auto">
          {minutes.map((minute) => (
            <SelectItem key={minute} value={minute}>{minute}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimePickerWheel;
