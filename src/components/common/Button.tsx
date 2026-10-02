import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isMagnetic?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isMagnetic = false,
      icon,
      iconPosition = 'right',
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isMagnetic) return;
      const { clientX, clientY, currentTarget } = e;
      const { left, top, width, height } = currentTarget.getBoundingClientRect();
      const x = (clientX - (left + width / 2)) * 0.25;
      const y = (clientY - (top + height / 2)) * 0.25;
      setPosition({ x, y });
    };

    const handleMouseLeave = () => {
      if (!isMagnetic) return;
      setPosition({ x: 0, y: 0 });
    };

    const variantStyles = {
      primary: 'bg-navy text-white hover:bg-navy-500 border border-transparent shadow-sm',
      secondary: 'bg-beige-200 text-navy hover:bg-beige-300 border border-beige-300 shadow-xs',
      outline: 'bg-transparent text-navy border-2 border-navy hover:bg-navy hover:text-white',
      ghost: 'bg-transparent text-navy hover:bg-beige-100 border border-transparent',
    }[variant];

    const sizeStyles = {
      sm: 'text-xs py-2 px-4 space-x-1.5',
      md: 'text-xs sm:text-sm py-3.5 px-7 space-x-2',
      lg: 'text-sm sm:text-base py-4 px-9 space-x-2.5',
    }[size];

    return (
      <motion.button
        ref={ref || internalRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={isMagnetic ? { x: position.x, y: position.y } : undefined}
        transition={{ type: 'spring', damping: 15, stiffness: 150, mass: 0.1 }}
        whileTap={{ scale: 0.97 }}
        className={`inline-flex items-center justify-center font-montserrat font-bold tracking-wider uppercase transition-all duration-200 rounded-md focus:outline-none cursor-pointer select-none ${variantStyles} ${sizeStyles} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...(props as any)}
      >
        {icon && iconPosition === 'left' && <span className="inline-flex">{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && <span className="inline-flex">{icon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
