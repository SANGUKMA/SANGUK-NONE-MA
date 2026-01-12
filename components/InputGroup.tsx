import React from 'react';

interface InputGroupProps {
  id: string;
  label: string;
  type?: 'text' | 'date' | 'time';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  icon,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        {icon && <span className="text-gray-500">{icon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="block w-full rounded-lg border-gray-300 border p-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white transition-colors hover:border-blue-300"
      />
    </div>
  );
};