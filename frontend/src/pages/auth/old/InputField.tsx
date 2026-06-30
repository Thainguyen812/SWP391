import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  rightIcon,
  onRightIconClick,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="w-full">
      <label 
        htmlFor={id} 
        className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-1.5"
      >
        {label}
      </label>
      <div className="relative rounded-md shadow-xs">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`
            block w-full rounded-lg border border-slate-200 bg-white py-2.5 
            ${icon ? 'pl-10' : 'pl-3.5'} 
            ${rightIcon ? 'pr-10' : 'pr-3.5'} 
            text-[14px] text-slate-800 placeholder-slate-400/80
            transition-all duration-200 outline-hidden
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:bg-white
            disabled:bg-slate-50 disabled:text-slate-400/80
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden transition-colors"
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && (
        <span className="block text-xs text-red-500 mt-1 select-none">
          {error}
        </span>
      )}
    </div>
  );
};
