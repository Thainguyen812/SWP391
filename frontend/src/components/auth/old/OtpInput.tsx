import React, { useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, disabled }) => {
  const length = 6;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize array of values from the parent string value
  const otpArray = Array.from({ length }).map((_, idx) => value[idx] || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/[^0-9]/g, ''); // numbers only
    const newOtpArray = [...otpArray];

    if (val === '') {
      // Handle backspace/deletion in the current cell
      newOtpArray[index] = '';
      onChange(newOtpArray.join(''));
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    // Determine the newly typed character by comparing with the old character in the cell
    let lastChar = val[val.length - 1];
    if (val.length > 1) {
      const oldChar = otpArray[index];
      if (val[0] === oldChar) {
        lastChar = val[1];
      } else {
        lastChar = val[0];
      }
    }

    newOtpArray[index] = lastChar;
    const newOtp = newOtpArray.join('');
    onChange(newOtp);

    // Auto focus next field
    if (index < length - 1 && lastChar !== '') {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      // If the current cell is already empty, delete the previous cell and focus it
      if (otpArray[index] === '' && index > 0) {
        const newOtpArray = [...otpArray];
        newOtpArray[index - 1] = '';
        onChange(newOtpArray.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg p-4.5 mt-3 animate-fade-in">
      <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-2">
        Mã xác thực OTP
      </label>
      
      <div className="flex justify-between gap-2 max-w-xs mx-auto mb-3">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            id={`otp-cell-${index}`}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otpArray[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={disabled}
            placeholder="-"
            className={`
              w-10 h-11 text-center font-bold text-lg rounded-md border 
              bg-white text-slate-800 transition-all outline-hidden
              focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500
              disabled:opacity-60 disabled:bg-slate-100
              ${otpArray[index] ? 'border-blue-500 bg-blue-50/10' : 'border-slate-200'}
            `}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-1.5 text-slate-500 text-[12px]">
        <Info id="otp-info" className="w-[14px] h-[14px] text-blue-500 shrink-0" />
        <span>Mã đã được gửi qua Gmail.</span>
      </div>
    </div>
  );
};
