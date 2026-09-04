interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
}

export function Select({ label, name, value, onChange, options, required, disabled, placeholder, style }: SelectProps) {
  return (
    <div className="form-group" style={style}>
      <label htmlFor={name}>{label}</label>
      <select
        id={name}
        name={name}
        className="field-input"
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={disabled}
      >
        {placeholder && !value && <option value="" disabled>{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
