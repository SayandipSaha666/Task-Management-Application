import React from 'react'
import {Button} from '../ui/button'
function CommonButton({onClick,buttonText,type,disabled,variant,className}) {
  return (
    <Button
    onClick={onClick || null}
    type={type || 'submit'}
    disabled={disabled || false}
    className={
      variant === 'ghost'
        ? `h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${className || ''}`
        : `flex h-11 justify-center items-center px-6 rounded-xl btn-gradient text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`
    }
    variant={variant === 'ghost' ? 'ghost' : undefined}
    >
      {buttonText}
    </Button>
  )
}

export default CommonButton;