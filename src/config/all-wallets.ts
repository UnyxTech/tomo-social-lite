import { ChainType, TomoProviderSetting } from '../state'
import { walletList } from '@tomo-inc/tomo-wallet-provider'
import {
  tomoInjectedBtcWallet,
  tomoInjectedCosmosWallet
} from './tomoInjected/TomoInjectedWallet'

export type TomoWalletType = 'extension' | 'qrcode' | 'injected'
export type TomoWallet = {
  id: string
  img: string
  name: string
  type: TomoWalletType
  chainType: ChainType
  connectProvider: any
  isInstall?: boolean
}

export let allWallets = [
  tomoInjectedBtcWallet,
  tomoInjectedCosmosWallet,
  ...walletList
] as TomoWallet[]

export let allWalletMap = allWallets.reduce((m: any, item) => {
  m[item.id] = item
  return m
}, {}) as Record<string, TomoWallet>
export let indexWalletIds = allWallets.map((item) => item.id) as string[]

export type WalletId = string

export function getWalletById(id: WalletId, tomoSetting: TomoProviderSetting) {
  return (
    tomoSetting.additionalWallets?.find((item) => item.id === id) ||
    allWalletMap[id]
  )
}

export function getIndexWallets(tomoSetting: TomoProviderSetting) {
  let walletList = (tomoSetting.indexWallets || [])
    .map((id) => {
      return getWalletById(id, tomoSetting)
    })
    .filter((item) => !!item)
  if (
    (!tomoSetting.indexWallets ||
      tomoSetting.indexWallets === indexWalletIds) &&
    tomoSetting.additionalWallets
  ) {
    walletList = [
      ...walletList.filter((item) => {
        return tomoSetting.additionalWallets?.every(
          (addItem) => addItem.id !== item.id
        )
      }),
      ...tomoSetting.additionalWallets
    ]
  }
  return walletList
}
