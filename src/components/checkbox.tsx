import classNames from 'classnames'
import { CheckIcon } from './icon/min-icon'

export default function Checkbox({
  check = false,
  onChange
}: {
  check?: boolean
  onChange?: (check: boolean) => void
}) {
  return (
    <div
      className={classNames(
        'tm-rounded tm-border tm-border-primary dark:tm-border-primary-dark tm-size-5 tm-flex tm-items-center tm-justify-center tm-cursor-pointer',
        {
          'tm-bg-primary dark:tm-bg-primary-dark': check
        }
      )}
      onClick={() => onChange?.(!check)}
    >
      {check && (
        <CheckIcon className={'tm-text-white dark:tm-text-white-dark tm-f'} />
      )}
    </div>
  )
}
