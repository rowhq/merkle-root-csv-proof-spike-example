// Single Responsibility Principle - Reusable button component
import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  children
}) => {
  return (
    <>
      <button
        className={`action-button ${variant} ${loading ? 'loading' : ''}`}
        onClick={onClick}
        disabled={disabled || loading}
      >
        {loading && <span className="spinner">⟳</span>}
        {children}
      </button>

    </>
  );
};