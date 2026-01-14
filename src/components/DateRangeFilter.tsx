import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

export type FilterRange = 'this-month' | 'last-month' | 'this-year' | 'custom';

interface DateRangeFilterProps {
  onRangeChange: (range: { start: Date; end: Date }) => void;
  className?: string;
}

export function DateRangeFilter({ onRangeChange, className }: DateRangeFilterProps) {
  const [rangeType, setRangeType] = useState<FilterRange>('this-month');
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const handleRangeSelect = (type: FilterRange) => {
    setRangeType(type);
    let start = new Date();
    let end = new Date();

    switch (type) {
      case 'this-month':
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
        onRangeChange({ start, end });
        break;
      case 'last-month':
        const lastMonth = subMonths(new Date(), 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        onRangeChange({ start, end });
        break;
      case 'this-year':
        start = startOfYear(new Date());
        end = endOfYear(new Date());
        onRangeChange({ start, end });
        break;
      case 'custom':
        // Custom range is handled by the calendar popover
        if (customRange?.from && customRange?.to) {
          onRangeChange({ start: customRange.from, end: customRange.to });
        }
        break;
    }
  };

  const handleCustomRangeChange = (range: DateRange | undefined) => {
    setCustomRange(range);
    if (range?.from && range?.to) {
      onRangeChange({ start: range.from, end: range.to });
    }
  };

  const getRangeLabel = () => {
    switch (rangeType) {
      case 'this-month': return 'This Month';
      case 'last-month': return 'Last Month';
      case 'this-year': return 'This Year';
      case 'custom':
        if (customRange?.from && customRange?.to) {
          return `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d, yyyy')}`;
        }
        return 'Custom Range';
      default: return 'Select Range';
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="glass-button min-w-[160px] justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span>{getRangeLabel()}</span>
            </div>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => handleRangeSelect('this-month')}>
            This Month
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRangeSelect('last-month')}>
            Last Month
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRangeSelect('this-year')}>
            This Year
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Popover>
            <PopoverTrigger asChild>
              <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                Custom Range
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={customRange?.from}
                selected={customRange}
                onSelect={(range) => {
                  handleCustomRangeChange(range);
                  setRangeType('custom');
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
