import { useAtomValue } from 'jotai'
import {
  ChainType,
  clientMapAtom,
  pagesAtom,
  tomoProviderSettingAtom,
  walletStateAtom
} from '../../state'
import { PageContext, usePageService } from '../../hooks/usePageService'
import { Suspense, useEffect, useRef, useState } from 'react'
import { ReloadIcon } from '../icon/min-icon'
import classNames from 'classnames'
import { LoadingSpin } from '../../hooks/useLoading'
import SelectWallet from './select-wallet'
import { GlobalMsg } from '../global-msg'

export function TomoSocial({
  className,
  isModal,
  chainType
}: {
  className?: string
  isModal?: boolean
  chainType: ChainType
}) {
  const pages = useAtomValue(pagesAtom)
  const pageService = usePageService()
  const pageCount = pages.filter((item) => item.type === 'page').length

  const pageList = pages.filter((item) => item.type === 'page')
  const curPageId = pageList[pageList.length - 1]?.id || 0
  const drawerList = pages.filter((item) => item.type === 'drawer')

  return (
    <div
      className={classNames(
        'tomo-social tm-relative tm-flex tm-max-w-full tm-justify-start tm-overflow-hidden tm-rounded-3xl tm-bg-mbg dark:tm-bg-mbg-dark tm-text-tc1 dark:tm-text-tc1-dark',
        {
          'tm-rounded-b-none': isModal
        },
        className
      )}
      style={{
        filter: 'drop-shadow(0px 2px 5px rgba(0, 0, 0, 0.20))'
      }}
    >
      <div
        className={'tm-flex tm-max-w-full'}
        style={{
          transform: `translateX(-${(pageCount / (pageCount + 1)) * 100}%)`
        }}
      >
        <div className={'tm-h-fit tm-max-w-full tm-overflow-hidden'}>
          <TomoIndex chainType={chainType} />
        </div>
        {pageList.map((page) => {
          return (
            <div className={'tm-relative tm-overflow-hidden'} key={page.id}>
              <Suspense fallback={<LoadingSpin />}>
                <PageContext.Provider value={{ id: page.id, page: page }}>
                  {page.jsx}
                </PageContext.Provider>
              </Suspense>
            </div>
          )
        })}
      </div>

      {drawerList.map((page) => {
        const isHidden = curPageId !== page.openPageId
        return (
          <div
            key={page.id}
            className={classNames(
              'tm-absolute tm-bottom-0 tm-left-0 tm-h-full tm-w-full tm-bg-tc1/70',
              {
                'tm-hidden': isHidden,
                'animate__animated animate__fadeIn animate__faster':
                  page.opt?.animate !== false
              }
            )}
            onClick={() => {
              if (page.opt?.maskClosable !== false) {
                pageService.close(page.id)
              }
            }}
          >
            <div
              onClick={(e) => {
                e.stopPropagation()
              }}
              className={classNames(
                'tm-absolute tm-bottom-0 tm-left-0 tm-max-h-full tm-w-full tm-overflow-hidden',
                {
                  'tm-bg-white dark:tm-bg-white-dark': !page.opt?.noBg,
                  'tm-h-full': page.opt?.full,
                  'animate__animated animate__fadeInUp animate__faster':
                    page.opt?.animate !== false
                }
              )}
            >
              <PageContext.Provider value={{ id: page.id, page: page }}>
                {page.jsx}
              </PageContext.Provider>
            </div>
          </div>
        )
      })}
      <GlobalMsg />
    </div>
  )
}

function TomoIndex({ chainType }: { chainType: ChainType }) {
  const clientMap = useAtomValue(clientMapAtom)
  if (!clientMap.state) {
    return (
      // eslint-disable-next-line tailwindcss/no-custom-classname
      <div
        className={
          'tm-flex tm-h-[700px] tm-w-[660px] tm-items-center tm-justify-center'
        }
      >
        <ReloadIcon
          className={
            'tm-size-6 tm-animate-spin tm-text-tc1 dark:tm-text-tc1-dark'
          }
        />
      </div>
    )
  }
  return <SelectWallet chainType={chainType} />
}
