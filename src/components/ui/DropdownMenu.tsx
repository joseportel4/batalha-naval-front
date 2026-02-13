'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

const DropdownMenuContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  className,
}) => {
  const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext);

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn('outline-none', className)}
    >
      {children}
    </button>
  );
};

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  align = 'end',
  className,
}) => {
  const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute z-50 mt-2 min-w-[12rem] overflow-hidden rounded-md border border-slate-800 bg-slate-900 p-1 shadow-lg',
        'animate-in fade-in-0 zoom-in-95',
        alignmentClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  onClick,
  className,
}) => {
  const { setIsOpen } = React.useContext(DropdownMenuContext);

  const handleClick = () => {
    onClick?.();
    setIsOpen(false);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors',
        'hover:bg-slate-800 hover:text-slate-100 focus:bg-slate-800 focus:text-slate-100',
        'text-slate-300',
        className
      )}
    >
      {children}
    </button>
  );
};

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({
  className,
}) => {
  return <div className={cn('my-1 h-px bg-slate-800', className)} />;
};

export const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('px-2 py-1.5 text-sm font-semibold text-slate-400', className)}>
      {children}
    </div>
  );
};
