import classNames from 'classnames'
import { ReloadIcon } from './icon/min-icon'

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  solid?: boolean
  primary?: boolean
  black?: boolean
  red?: boolean
  loading?: boolean
}

export default function Button({
  primary,
  red,
  className,
  children,
  loading,
  disabled,
  solid,
  ...otherProps
}: ButtonProps) {
  const isDisabled = loading || disabled
  const isDefault = !primary && !red
  return (
    <button
      {...otherProps}
      className={classNames(
        'tm-h-12 tm-w-full tm-rounded-lg tm-font-poppins tm-text-base tm-font-medium tm-transition-all',
        {
          'tm-border tm-border-tc1/10 dark:tm-border-tc1-dark/10 tm-bg-white dark:tm-bg-white-dark tm-text-tc1 dark:tm-text-tc1-dark':
            isDefault,
          'tm-border-none tm-bg-primary dark:tm-bg-primary-dark tm-text-primaryBtnText dark:tm-text-primaryBtnText-dark':
            primary && !solid,
          'tm-border tm-border-primary dark:tm-border-primary-dark tm-bg-transparent tm-text-primary dark:tm-text-primary-dark':
            primary && solid,
          'tm-border-none tm-bg-d tm-text-white dark:tm-text-white-dark':
            red && !solid,
          'tm-border tm-border-danger tm-bg-transparent tm-text-danger':
            red && solid,
          'tm-pointer-events-none': loading,
          'tm-cursor-pointer hover:tm-opacity-90': !isDisabled,
          'tm-cursor-not-allowed tm-opacity-20': isDisabled
        },
        className
      )}
      disabled={isDisabled || loading}
    >
      <div className={'tm-flex tm-gap-2 tm-items-center tm-justify-center'}>
        {loading && <ReloadIcon className={'tm-animate-spin'} />}
        {children}
      </div>
    </button>
  )
}
