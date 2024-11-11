import classNames from 'classnames'
import React, { useState } from 'react'

interface iTButton {
  className?: string
  type?: 'primary' | 'outline' | 'primaryGray'
  children?: React.ReactNode
  disabled?: boolean
  onClick?: () => void
}

const TButton = ({
  className,
  children,
  type = 'primary',
  disabled,
  onClick,
  ...props
}: iTButton & any) => {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <button
      className={classNames(
        'tm-py-[16px] tm-w-full tm-text-center tm-select-none tm-flex tm-justify-center tm-items-center tm-w-[90%] tm-mx-auto tm-cursor-pointer dark:tm-bg-white dark:tm-text-black dark:tm-border-0 dark:tm-rounded-[8px] dark:tm-border-second dark:tm-border-solid',
        {
          'tm-bg-[#121212] tm-text-white tm-rounded-[8px]': type === 'primary',
          'tm-bg-[#1212120d] tm-text-second tm-rounded-[8px]':
            type === 'primaryGray',
          'tm-bg-white tm-text-black tm-rounded-[8px] tm-border-[1px] tm-border-second tm-border-solid':
            type === 'outline',
          'tm-hover:opacity-70 tm-transition-opacity tm-duration-200 tm-ease-in-out':
            !disabled && !isLoading,
          '!tm-bg-[#1212120d] !tm-text-[#12121299] tm-border-0 tm-cursor-not-allowed':
            disabled
        },
        className
      )}
      disabled={disabled || isLoading}
      onClick={async () => {
        setIsLoading(true)
        await onClick()
        setIsLoading(false)
      }}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  )
}

export default TButton
