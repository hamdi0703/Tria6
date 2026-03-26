
import React, { useState, useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

interface Option {
  label: string;
  value: string | number | null;
  count?: number; 
}

interface FilterDropdownProps {
  label: string;
  icon?: React.ReactNode;
  value: string | number | null;
  options: Option[];
  onChange: (value: any) => void;
  activeColor?: string; 
  align?: 'left' | 'right';
  minWidth?: string;
  className?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  icon,
  value,
  options,
  onChange,
  activeColor = 'bg-neutral-900 text-white dark:bg-white dark:text-black',
  align = 'left',
  minWidth = 'min-w-[140px]', // Adjusted default for mobile
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  const selectedOption = options.find(opt => opt.value === value);
  const isValueSelected = value !== null && value !== '' && value !== 'all' && value !== 'none';

  const handleSelect = (val: any) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border border-transparent shadow-sm hover:shadow-md active:scale-95 ${
          isValueSelected
            ? activeColor
            : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
            {icon && <span className={`flex-shrink-0 ${isValueSelected ? 'opacity-100' : 'opacity-70'}`}>{icon}</span>}
            <span className="truncate text-xs md:text-sm">
                {isValueSelected && selectedOption ? selectedOption.label : label}
            </span>
        </div>
        <svg 
            className={`w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 transition-transform duration-300 opacity-60 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - z-popover added */}
      <div
        className={`absolute z-popover mt-2 py-2 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800 transform transition-all duration-200 origin-top ${
          align === 'right' ? 'right-0' : 'left-0'
        } ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0 visible' 
            : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
        }`}
        style={{ 
            minWidth: '100%', 
            width: 'max-content', 
            maxWidth: '90vw' // Prevent overflow on small screens
        }} 
      >
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar px-1.5 space-y-0.5">
            {options.map((opt, idx) => {
                const isSelected = opt.value === value;
                return (
                    <button
                        key={`${opt.label}-${idx}`}
                        onClick={() => handleSelect(opt.value)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between group ${
                            isSelected
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                            : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                    >
                        <span className="truncate pr-2 whitespace-normal">{opt.label}</span>
                        {isSelected && (
                            <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </button>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default FilterDropdown;
