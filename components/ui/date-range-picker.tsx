'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { addDays, format, startOfMonth, endOfMonth, startOfYear, subDays, subMonths } from 'date-fns'
import { DateRange, SelectRangeEventHandler } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DateRangePickerProps {
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({
  date,
  onDateChange,
  className,
}: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(date)
  const [isOpen, setIsOpen] = React.useState(false)

  const presets = [
    {
      label: 'Last 7 days',
      getValue: () => ({
        from: subDays(new Date(), 6),
        to: new Date(),
      }),
    },
    {
      label: 'Last 30 days',
      getValue: () => ({
        from: subDays(new Date(), 29),
        to: new Date(),
      }),
    },
    {
      label: 'This month',
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      }),
    },
    {
      label: 'Last month',
      getValue: () => {
        const lastMonth = subMonths(new Date(), 1)
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        }
      },
    },
    {
      label: 'Last 3 months',
      getValue: () => ({
        from: subMonths(new Date(), 3),
        to: new Date(),
      }),
    },
    {
      label: 'Year to date',
      getValue: () => ({
        from: startOfYear(new Date()),
        to: new Date(),
      }),
    },
    {
      label: 'All time',
      getValue: () => undefined,
    },
  ]

  const handlePresetSelect = (preset: string) => {
    const selectedPreset = presets.find(p => p.label === preset)
    if (selectedPreset) {
      const newRange = selectedPreset.getValue()
      setSelectedRange(newRange)
      onDateChange?.(newRange)
      if (newRange) {
        setIsOpen(false)
      }
    }
  }

  const handleDateSelect: SelectRangeEventHandler = (range) => {
    setSelectedRange(range)
    if (range?.from && range?.to) {
      onDateChange?.(range)
      setTimeout(() => setIsOpen(false), 100)
    }
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[260px] justify-start text-left font-normal',
              !selectedRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedRange?.from ? (
              selectedRange.to ? (
                <>
                  {format(selectedRange.from, 'LLL dd, y')} -{' '}
                  {format(selectedRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(selectedRange.from, 'LLL dd, y')
              )
            ) : (
              <span>All time</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex">
            <div className="border-r p-3 space-y-1">
              <p className="text-sm font-medium mb-2">Quick select</p>
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start font-normal"
                  onClick={() => handlePresetSelect(preset.label)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={selectedRange?.from}
                selected={selectedRange}
                onSelect={handleDateSelect}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}