import { usePageControl } from '../../hooks/usePageService'
import { BackIcon } from '../icon/min-icon'

export function PageHeadMin({ children }: { children?: any }) {
  const pageControl = usePageControl()
  return (
    <div className={'tm-relative tm-w-full tm-py-7'}>
      <div
        className={
          'tm-flex tm-h-full tm-w-full tm-items-center tm-justify-center tm-text-xl tm-font-medium'
        }
      >
        <div>{children} &nbsp;</div>
      </div>
      {!!pageControl.page?.id && (
        <div
          className={'tm-absolute tm-top-1/2 tm-cursor-pointer tm-pl-5'}
          style={{ transform: 'translateY(-50%)' }}
          onClick={() => pageControl.close()}
        >
          <BackIcon className={'tm-size-4'} />
        </div>
      )}
    </div>
  )
}

export function PageHeader({
  children,
  onBack,
  showFlag
}: {
  children: any
  onBack?: () => void
  showFlag?: boolean
}) {
  const pageControl = usePageControl()
  const onPageBack = () => {
    if (showFlag) {
      localStorage.setItem('updateAssets', '1')
    }
    pageControl.close()
    onBack && onBack()
  }
  return (
    <div
      className={
        'tm-relative tm-box-border tm-flex tm-w-full tm-items-center tm-justify-between tm-bg-white tm-px-4 tm-pb-3 tm-pt-7 tm-shadow-header dark:tm-bg-white-dark dark:tm-shadow-none'
      }
    >
      <div
        className="tm-absolute tm-left-2 tm-flex tm-size-[44px] tm-cursor-pointer tm-items-center tm-justify-center tm-rounded-full"
        onClick={onPageBack}
      >
        <BackIcon />
      </div>
      <div className="tm-flex tm-w-full tm-items-center tm-justify-center tm-gap-1 tm-text-xl">
        {children}
      </div>
    </div>
  )
}

export function PageHeaderMin({
  children,
  onBack,
  showFlag,
  showBack = true,
  onClick
}: {
  children?: any
  onBack?: () => void
  showFlag?: boolean
  showBack?: boolean
  onClick?: () => void
}) {
  const pageControl = usePageControl()
  const onPageBack = () => {
    if (onClick) {
      onClick()
      return
    }

    if (showFlag) {
      localStorage.setItem('updateAssets', '1')
    }
    pageControl.close()
    onBack && onBack()
  }
  return (
    <div
      className={
        'tm-relative tm-box-border tm-flex tm-h-[68px] tm-w-full tm-items-center tm-justify-between tm-px-4 tm-pb-3 tm-pt-7'
      }
    >
      {showBack && (
        <div
          className="tm-absolute tm-left-2 tm-flex tm-size-[44px] tm-cursor-pointer tm-items-center tm-justify-center tm-rounded-full"
          onClick={onPageBack}
        >
          <BackIcon />
        </div>
      )}
      <div className="tm-flex tm-w-full tm-items-center tm-justify-center tm-gap-4 tm-text-xl tm-font-medium">
        {children}
      </div>
    </div>
  )
}
