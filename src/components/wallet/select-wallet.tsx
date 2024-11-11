import { usePageControl, usePageService } from '../../hooks/usePageService'
import { BottomPoweredBy } from './bottom-powered-by'
import {
  getIndexWallets,
  getWalletById,
  TomoWallet
} from '../../config/all-wallets'
import { useLoading, useLoadingPage } from '../../hooks/useLoading'
import useToast from '../../hooks/useToast'
import useWalletConnect from '../../hooks/useWalletConnect'
import { PageHeaderMin } from './page-head'
import React, { useMemo } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import {
  ChainType,
  tomoProviderSettingAtom,
  tomoStyleOptionAtom,
  walletStateAtom
} from '../../state'
import BtcConnectConfirm from './btc-connect-confirm'
import Button from 'components/Button'
import classNames from 'classnames'
import update from 'immutability-helper'

export default function SelectWallet() {
  const tomoSetting = useAtomValue(tomoProviderSettingAtom)
  if (!tomoSetting.chainTypes?.length) {
    throw new Error('chainTypes is required')
  }
  if (tomoSetting.chainTypes?.length === 1) {
    return (
      <SelectWalletChildren
        type={'connect'}
        chainType={tomoSetting.chainTypes[0]}
      />
    )
  }

  return <MultiWalletConnect />
}

function MultiWalletConnect() {
  const pageService = usePageService()
  const [loading, loadingFn] = useLoading()
  useLoadingPage(loading)
  const toast = useToast()
  const walletConnect = useWalletConnect()
  const tomoSetting = useAtomValue(tomoProviderSettingAtom)
  const walletState = useAtomValue(walletStateAtom)
  const selectCount = tomoSetting.chainTypes?.filter((chainType) => {
    return !!walletState[chainType].walletId
  }).length
  const [selectTab, setSelectTab] = React.useState('')

  const clickConnect = async () => {
    const result = await pageService.open(<BtcConnectConfirm />, {
      type: 'drawer'
    })
    if (!result) {
      return
    }

    loadingFn(async () => {
      try {
        await walletConnect.connect(
          tomoSetting.chainTypes.map((chainType) => {
            return walletState[chainType].walletId
          })
        )
      } catch (e) {
        console.log('error', e)
        toast.error(e?.message || 'Failed')
      }
    })
  }
  const isIndex = selectTab === ''
  return (
    <div className={'tm-relative tm-h-[618px] tm-w-full tm-overflow-hidden'}>
      <div
        className={
          'tm-box-border tm-flex tm-h-full tm-w-full tm-flex-col tm-items-center tm-gap-2'
        }
      >
        <PageHeaderMin showBack={!!selectTab} onClick={() => setSelectTab('')}>
          {isIndex
            ? 'Select your wallets'
            : `For ${tomoSetting.chainOption?.[selectTab]?.name}`}
        </PageHeaderMin>

        <div
          className={
            'tm-box-border tm-w-full tm-flex-1 tm-gap-3 tm-flex tm-flex-col tm-overflow-hidden tm-pb-4'
          }
        >
          <div
            className={'tm-flex tm-flex-col tm-flex-1 tm-overflow-auto tm-px-5'}
          >
            {selectTab ? (
              <MultiWalletTabList
                chainType={selectTab}
                back={() => setSelectTab('')}
              />
            ) : (
              <div className={'tm-gap-3 tm-flex tm-flex-col tm-flex-1'}>
                <div
                  className={'tm-flex tm-w-full tm-flex-1 tm-flex-col tm-gap-3'}
                >
                  {tomoSetting.chainTypes?.map((chainType) => {
                    return (
                      <ChainTypeWalletSelectItem
                        chainType={chainType}
                        onClick={() => {
                          setSelectTab(chainType)
                        }}
                        key={chainType}
                      />
                    )
                  })}
                </div>
                <div className="tm-bg-red tm-flex tm-flex-col tm-items-center tm-justify-center tm-pt-8 tm-text-center tm-gap-4">
                  <Button
                    primary
                    disabled={selectCount !== tomoSetting.chainTypes?.length}
                    onClick={clickConnect}
                  >
                    Connect
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <BottomPoweredBy />
      </div>
    </div>
  )
}

function MultiWalletTabList({
  chainType,
  back
}: {
  chainType: ChainType
  back: () => void
}) {
  const walletList = useWalletList(chainType)
  const [walletState, setWalletState] = useAtom(walletStateAtom)
  const toast = useToast()
  return (
    <div className={'tm-flex-1 tm-overflow-hidden'}>
      <div
        className={'tm-flex tm-flex-col tm-h-full tm-gap-3 tm-overflow-auto'}
      >
        {walletList.map((wallet) => {
          return (
            <AccountItem
              key={`some-${wallet.id}`}
              checked={wallet.id === walletState[chainType].walletId}
              wallet={wallet}
              onClick={() => {
                if (!wallet._isInstall) {
                  toast.warning('Wallet not installed')
                  return
                }
                setWalletState((prev) => {
                  return update(prev, {
                    [chainType]: {
                      walletId: {
                        $set: wallet.id
                      }
                    }
                  })
                })
                back()
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

function MultiTopTabItem({
  selected,
  children,
  ...otherProps
}: {
  selected: boolean
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <div
      {...otherProps}
      className={classNames(
        'tm-flex-1 tm-h-12 tm-flex first:tm-border-l-0 tm-items-center tm-border tm-border-[#D4D4D4] dark:tm-border-[#282828] tm-border-r-0 tm-justify-center tm-cursor-pointer',
        {
          'tm-bg-white dark:tm-bg-[#282828]': selected
        }
      )}
    >
      <div
        className={classNames('tm-flex tm-gap-1', {
          'tm-grayscale tm-opacity-45': !selected
        })}
      >
        {children}
      </div>
    </div>
  )
}

function useWalletList(chainType?: ChainType) {
  const tomoSetting = useAtomValue(tomoProviderSettingAtom)
  return useMemo(() => {
    const list = getIndexWallets(tomoSetting)
    let isInjected = false
    return list
      .filter((wallet) => (chainType ? wallet.chainType === chainType : true))
      .map((wallet) => {
        let isInstall = true
        try {
          new wallet.connectProvider()
        } catch (e) {
          isInstall = false
        }
        wallet._isInstall = isInstall
        wallet._isMultipleChains = list.some(
          (item) => item !== wallet && item.name === wallet.name
        )
        if (wallet?.type === 'injected') {
          if (isInstall) {
            isInjected = true
          } else {
            return null
          }
        }
        return wallet
      })
      .filter((item) => {
        return !!item && (!isInjected || item.type !== 'extension')
      }) as (TomoWallet & { isInstall: boolean; isMultipleChains: boolean })[]
  }, [tomoSetting.additionalWallets, chainType])
}

export function SelectWalletChildren(props: {
  chainType?: ChainType
  type: 'connect' | 'select'
}) {
  const { chainType, type } = props
  const pageService = usePageService()
  const [loading, loadingFn] = useLoading()
  useLoadingPage(loading)
  const toast = useToast()
  const walletConnect = useWalletConnect()
  const tomoSetting = useAtomValue(tomoProviderSettingAtom)
  const pageControl = usePageControl()
  const clickWallet = async (wallet: TomoWallet) => {
    try {
      new wallet.connectProvider()
    } catch (e) {
      toast.warning('Wallet not installed')
      return
    }
    if (type === 'select') {
      pageControl.close(wallet)
      return
    }
    const result = await pageService.open(<BtcConnectConfirm />, {
      type: 'drawer'
    })
    if (!result) {
      return
    }

    loadingFn(async () => {
      try {
        await walletConnect.connect([wallet.id])
      } catch (e) {
        toast.error(e?.message || 'Failed')
      }
    })
  }

  const walletList = useWalletList(chainType)

  return (
    <div className={'tm-relative tm-h-[618px] tm-w-full tm-overflow-hidden'}>
      <div
        className={'tm-box-border tm-flex tm-h-full tm-w-full tm-flex-col  '}
      >
        <PageHeaderMin showBack={type === 'select'}>
          Select your {chainType} wallet
        </PageHeaderMin>
        <div
          className={
            'tm-box-border tm-w-full tm-flex-1 tm-gap-5 tm-overflow-y-auto tm-pb-6 tm-pt-2'
          }
        >
          {/* Accounts List */}
          <div
            className={
              'tm-flex tm-w-full tm-flex-1 tm-flex-col tm-gap-3 tm-overflow-auto tm-px-6'
            }
          >
            {/* Some Wallets */}
            {walletList.map((wallet) => {
              return (
                <AccountItem
                  key={`some-${wallet.id}`}
                  wallet={wallet}
                  onClick={() => {
                    clickWallet(wallet)
                  }}
                />
              )
            })}
          </div>
        </div>
        {/* Footers */}
        <div className="tm-bg-red tm-flex tm-flex-row tm-items-center tm-justify-center tm-pt-8 tm-text-center">
          <BottomPoweredBy />
        </div>
      </div>
    </div>
  )
}

interface iAccountItem {
  onClick?: () => void
  wallet: TomoWallet
  checked?: boolean
}

function AccountItem({ wallet, ...otherProps }: iAccountItem) {
  const { onClick, checked } = otherProps
  const handleClick = () => {
    onClick && onClick()
  }
  const tomoSetting = useAtomValue(tomoProviderSettingAtom)
  const option = tomoSetting.chainOption?.[wallet.chainType]
  return (
    <div
      className={classNames(
        'tm-flex tm-h-[58px] tm-cursor-pointer tm-justify-between tm-rounded-lg tm-bg-white dark:tm-bg-[#282828] tm-px-4 hover:tm-bg-opacity-60',
        {
          'tm-border tm-border-primary': checked
        }
      )}
      onClick={handleClick}
    >
      {/* Account icon & name */}
      <div className={'tm-flex tm-items-center tm-gap-3.5 '}>
        <div className="tm-size-[26px]">
          <img
            src={wallet?.img}
            alt={wallet?.name}
            className={'tm-h-full tm-w-full tm-rounded-lg'}
          />
        </div>
        <div className={'tm-font-medium tm-text-base'}>{wallet.name}</div>
      </div>
      {/* Account links */}
      <div className={'tm-flex tm-items-center tm-gap-2'}>
        {/*{checked && <CheckIcon className={'tm-text-primary tm-size-6'} />}*/}
        {wallet.type === 'extension' && wallet._isInstall && (
          <div
            className={
              'tm-bg-[#e3e3e3] dark:tm-bg-[#303030] tm-px-2.5 tm-rounded-full tm-text-xs tm-text-[#666] dark:tm-text-white'
            }
          >
            Installed
          </div>
        )}
        {wallet.type === 'qrcode' && (
          <div
            className={
              'tm-bg-primary/20 tm-px-2.5 tm-rounded-full tm-text-xs tm-text-primary'
            }
          >
            QR code
          </div>
        )}
        {wallet.type === 'injected' && (
          <div
            className={
              'tm-bg-primary/20 tm-px-2.5 tm-rounded-full tm-text-xs tm-text-primary'
            }
          >
            Injected
          </div>
        )}
      </div>
    </div>
  )
}

function ChainTypeWalletSelectItem({
  chainType,
  onClick
}: {
  chainType: ChainType
  onClick?: () => void
}) {
  const [walletState, setWalletState] = useAtom(walletStateAtom)
  const tomoSetting = useAtomValue(tomoProviderSettingAtom)
  const tomoStyleOption = useAtomValue(tomoStyleOptionAtom)
  const walletId = walletState[chainType].walletId
  const wallet = getWalletById(walletId, tomoSetting)
  const option = tomoSetting.chainOption?.[chainType]
  return (
    <div
      className={
        'tm-flex tm-h-[80px] tm-cursor-pointer tm-justify-between tm-rounded-lg tm-bg-white dark:tm-bg-[#282828] tm-px-4 hover:tm-bg-opacity-60 tm-border tm-border-tc1/10'
      }
      onClick={onClick}
    >
      {/* Account icon & name */}
      <div className={'tm-flex tm-items-center tm-gap-3.5 '}>
        <div className="tm-size-8">
          <img
            src={
              (tomoStyleOption.theme === 'dark' && option?.darkLogo) ||
              option?.logo
            }
            className={'tm-size-[30px]'}
          />
        </div>
        <div className={' tm-flex tm-flex-col'}>
          <div className={'tm-text-lg tm-font-medium'}>
            <span className={'tm-font-normal'}>For</span> {option?.name}
          </div>
          {wallet && (
            <div className={'tm-flex tm-gap-1 tm-items-center'}>
              <div
                className={
                  'tm-size-1.5 tm-border tm-border-primary tm-rounded-full'
                }
              ></div>
              <div className={'tm-text-xs'}>{wallet.name}</div>
            </div>
          )}
        </div>
      </div>
      {/* Account links */}
      <div className={'tm-flex tm-items-center tm-gap-2'}>
        <div
          className={
            'tm-rounded-full tm-px-4 tm-text-xs tm-font-medium tm-bg-tc1 dark:tm-bg-[#444] tm-text-white tm-h-6 tm-flex tm-items-center'
          }
        >
          Select
        </div>
      </div>
    </div>
  )
}
