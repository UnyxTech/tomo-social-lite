import { BottomPoweredBy } from './bottom-powered-by'
import { getIndexWallets, TomoWallet } from '../../config/all-wallets'
import { useLoading, useLoadingPage } from '../../hooks/useLoading'
import useToast from '../../hooks/useToast'
import useWalletConnect from '../../hooks/useWalletConnect'
import React, { useEffect, useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import { ChainType, tomoProviderSettingAtom } from '../../state'
import classNames from 'classnames'
import { getDeviceType } from '../../utils/utils'
import update from 'immutability-helper'

export default function SelectWallet({ chainType }: { chainType: ChainType }) {
  return <SelectWalletChildren type={'connect'} chainType={chainType} />
}

export function useClickWallet() {
  const walletConnect = useWalletConnect()
  const tomoSetting = useAtomValue(tomoProviderSettingAtom)
  return async (wallet: TomoWallet) => {
    try {
      await new wallet.connectProvider({
        chains: [],
        ...tomoSetting.providerOptions
      }).init()
    } catch (e) {
      throw new Error('Wallet not installed')
    }
    await walletConnect.connect([wallet.id])
  }
}

export function useWalletList(chainType?: ChainType) {
  const tomoSetting = useAtomValue(tomoProviderSettingAtom)

  return useMemo(() => {
    const list = getIndexWallets(tomoSetting)
    return list.filter((wallet) =>
      chainType ? wallet.chainType === chainType : true
    )
  }, [tomoSetting, chainType])
}

export function useWalletListWithIsInstall(chainType?: ChainType) {
  const tomoSetting = useAtomValue(tomoProviderSettingAtom)
  const [allWalletWithInstall, setAllWalletWithInstall] = useState<
    TomoWallet[]
  >(() => {
    return getIndexWallets(tomoSetting).map((wallet) => ({
      ...wallet,
      isInstall: false
    })) as TomoWallet[]
  })
  // const [walletList, setWalletList] = useState<TomoWallet[]>()
  const walletList = useMemo(() => {
    let isInjected = false
    const isDesktop = getDeviceType() === 'desktop'
    return allWalletWithInstall
      .filter((wallet) => {
        const isShow = chainType ? wallet.chainType === chainType : true
        if (isShow && wallet.type === 'injected' && !isDesktop) {
          if (wallet.isInstall) {
            isInjected = true
          } else {
            return false
          }
        }
        return isShow
      })
      .filter((wallet) => {
        if (isDesktop) {
          return wallet.isInstall || wallet.type !== 'injected'
        }
        return wallet.isInstall || !isInjected
      })
  }, [allWalletWithInstall, chainType])
  const reloadWalletList = async () => {
    allWalletWithInstall
      .filter((wallet) => (chainType ? wallet.chainType === chainType : true))
      .forEach(async (wallet) => {
        if (wallet.isInstall) {
          return
        }
        try {
          await new wallet.connectProvider({
            chains: [],
            ...tomoSetting.providerOptions
          }).init()
          setAllWalletWithInstall((prev) => {
            return update(prev, {
              [prev.findIndex((w) => wallet.id === w.id)]: {
                isInstall: { $set: true }
              }
            })
          })
        } catch (e) {
          //
        }
      })
  }
  useEffect(() => {
    reloadWalletList()
  }, [tomoSetting, chainType])
  return walletList
}

export function SelectWalletChildren(props: {
  chainType: ChainType
  type: 'connect' | 'select'
}) {
  const { chainType, type } = props
  const [loading, loadingFn] = useLoading()
  useLoadingPage(loading)
  const clickWallet = useClickWallet()
  const toast = useToast()
  const walletList = useWalletListWithIsInstall(chainType) || []
  return (
    <div
      className={
        'tm-relative tm-flex tm-h-[700px] tm-w-[660px] tm-max-w-full tm-max-w-full tm-flex-col tm-justify-start tm-gap-5 tm-overflow-hidden tm-bg-white tm-pt-9 tm-text-tc1 dark:tm-bg-mbg-dark dark:tm-text-tc1-dark'
      }
    >
      <div className={'tm-flex tm-flex-col tm-gap-5 tm-px-6 tm-pb-9'}>
        <div className={'tm-text-[24px]'}>Select your wallet</div>
        <div>
          Connect a <span className={'tm-capitalize'}>{chainType}</span> Wallet
        </div>
      </div>

      <div
        className={
          'tm-box-border tm-w-full tm-flex-1 tm-gap-5 tm-overflow-y-auto tm-pb-6 tm-pt-2'
        }
      >
        {/* Accounts List */}
        <div
          className={
            'tm-grid tm-w-full tm-flex-1 tm-grid-cols-1 sm:tm-grid-cols-2 tm-gap-6 tm-px-6'
          }
        >
          {/* Some Wallets */}
          {walletList.map((wallet) => {
            return (
              <AccountItem
                key={`some-${wallet.id}`}
                wallet={wallet}
                onClick={() => {
                  loadingFn(async () => {
                    try {
                      await clickWallet(wallet)
                    } catch (e: any) {
                      toast.error(e?.message || 'Failed')
                    }
                  })
                }}
              />
            )
          })}
        </div>
      </div>
      {/* Footers */}
      <div className="tm-bg-red tm-flex tm-flex-row tm-items-center tm-justify-center tm-text-center">
        <BottomPoweredBy />
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
  return (
    <div
      className={classNames(
        'tm-flex tm-h-[58px] tm-cursor-pointer tm-justify-between tm-rounded-lg tm-bg-white dark:tm-bg-[#282828] tm-px-2 hover:tm-bg-tc1/5 dark:hover:tm-bg-opacity-60 tm-border tm-border-[rgba(94,96,97,0.30)] tm-transition',
        {
          'tm-border tm-border-primary': checked
        }
      )}
      onClick={handleClick}
    >
      {/* Account icon & name */}
      <div className={'tm-flex tm-items-center tm-gap-3.5 '}>
        <div className="tm-size-[34px]">
          <img
            src={wallet?.img}
            alt={wallet?.name}
            className={'tm-h-full tm-w-full tm-rounded-lg'}
          />
        </div>
        <div className={'tm-text-sm'}>{wallet.name}</div>
      </div>
      {/* Account links */}
      <div className={'tm-flex tm-items-center tm-gap-2'}>
        {/*{checked && <CheckIcon className={'tm-text-primary tm-size-6'} />}*/}
        {wallet.type === 'extension' && wallet.isInstall && (
          <WalletLabel>Installed</WalletLabel>
        )}
        {wallet.type === 'qrcode' && <WalletLabel>QR code</WalletLabel>}
        {wallet.type === 'injected' && <WalletLabel>Injected</WalletLabel>}
      </div>
    </div>
  )
}

function WalletLabel({ children }: { children: any }) {
  return (
    <div
      className={
        'tm-rounded-full tm-bg-[#f6f7f3] tm-px-2.5 tm-py-1 tm-text-[10px] tm-text-[#666] dark:tm-bg-[#444] dark:tm-text-white'
      }
    >
      {children}
    </div>
  )
}
