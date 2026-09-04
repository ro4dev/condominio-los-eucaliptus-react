import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  icon?: string;
  style?: React.CSSProperties;
  id?: string;
  form?: string;
  title?: string;
}

export function Button({ children, onClick, type = 'button', disabled, className = '', icon, style, id, form, title }: ButtonProps) {
  return (
    <button type={type} id={id} form={form} title={title} className={'btn btn-primary ' + className} onClick={onClick} disabled={disabled} style={style}>
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}

interface TextButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}

export function TextButton({ children, onClick, type = 'button', disabled, className = '' }: TextButtonProps) {
  return (
    <button type={type} className={'btn btn-text ' + className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

interface IconButtonProps {
  icon: string;
  onClick?: () => void;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function IconButton({ icon, onClick, title, className = '', style }: IconButtonProps) {
  return (
    <button type="button" className={'icon-btn ' + className} onClick={onClick} title={title} style={style} aria-label={title || icon}>
      <Icon name={icon} />
    </button>
  );
}
