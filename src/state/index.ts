import { atom, PrimitiveAtom } from 'jotai'
import { bitcoinChains, cosmosChains } from '../config/chains'

// global buffer init
import { Buffer as BufferPolyfill } from 'buffer'
import { ModalResult } from '../components/wallet/tomo-modal'
import { indexWalletIds, TomoWallet, WalletId } from '../config/all-wallets'
import {
  DefaultChainOption,
  TomoChainBTC,
  TomoChainCosmos,
  TomoChainOption
} from '../config/chain-base'
import { BTCProvider, CosmosProvider } from '@tomo-inc/tomo-wallet-provider'

if (typeof window !== 'undefined') {
  window.Buffer = BufferPolyfill
}

export const INIT_ARRAY_STATE = []
export const INIT_OBJECT_STATE = {}

type WithInitialValue<Value> = {
  init: Value
}

function createPersistenceAtom<Value>(
  name: string,
  defaultValue: Value
): PrimitiveAtom<Value> & WithInitialValue<Value> {
  if (typeof window === 'undefined') {
    return atom(defaultValue)
  }
  const data = localStorage.getItem(name)
  const flag = data === 'undefined' || data === null
  const tempAtom = atom<Value>(
    flag ? defaultValue : (JSON.parse(data as string) as Value)
  )

  // @ts-ignore
  return atom(
    (get) => get(tempAtom),
    (get, set, newObj: Value) => {
      let newValue = newObj
      if (typeof newObj === 'function') {
        newValue = newObj(get(tempAtom))
      }
      localStorage.setItem(name, JSON.stringify(newValue))
      set(tempAtom, newValue)
      return newValue
    }
  )
}

export const chainTypeList = [
  // 'evm',
  'bitcoin',
  'cosmos'
  // 'solana',
  // 'ton',
  // 'tron'
] as const
export type ChainType = (typeof chainTypeList)[number]

type ConnectInfo = {
  address?: string
  chainId?: number
  network?: string
  connected: boolean
  walletId?: string
  chainType: ChainType
}

export type WalletState = {
  isConnected: boolean
} & Record<ChainType, ConnectInfo>

export const INIT_WALLET_STATE = {
  isConnected: false,
  bitcoin: {
    connected: false,
    chainType: 'bitcoin'
  },
  cosmos: {
    connected: false,
    chainType: 'cosmos'
  }
  // btcAddressType: 'P2TR'
} as WalletState

export const walletStateAtom = createPersistenceAtom<WalletState>(
  'tomo_wallet_state',
  INIT_WALLET_STATE
)

export type ClientMap = {
  // 0: loading 1: ready
  state: 0 | 1
  evmProvider?: any
  bitcoinProvider?: BTCProvider
  cosmosProvider?: CosmosProvider
  solanaProvider?: any
  tonProvider?: any
  tronProvider?: any
}

export const clientMapAtom = atom<ClientMap>({
  state: 0
})

export const installWalletsAtom = atom(INIT_ARRAY_STATE)

/* Page */
export type TomoPage = {
  jsx: any
  resolve: (v?: any) => void
  type: 'page' | 'drawer'
  id: number
  showClose: boolean
  openPageId?: number
  opt?: {
    // only drawer
    full?: boolean
    noBg?: boolean
    maskClosable?: boolean
    animate?: boolean
  }
}

export const pagesAtom = atom<TomoPage[]>([])

export const curPageAtom = atom((get) => {
  const pages = get(pagesAtom)
  const curPage = pages.findLast((p) => p.type === 'page')
  return curPage
})

export type TomoProviderSetting = {
  bitcoinChains?: TomoChainBTC[]
  cosmosChains?: TomoChainCosmos[]
  chainTypes?: ChainType[]
  indexWallets?: WalletId[]
  uiOptions?: {
    termsAndServiceUrl?: string
    privacyPolicyUrl?: string
  }
  additionalWallets?: TomoWallet[]
  sdkMode?: 'dev'
  logLevel?: 'debug'
  style?: {
    rounded?: 'none' | 'small' | 'medium' | 'large'
    theme?: 'light' | 'dark'
    primaryColor?: string
  }
  connectionHints?: {
    isRequired?: boolean
    text: any
    logo?: any
  }[]
  chainOption?: TomoChainOption
}

export const INIT_TOMO_SETTING = {
  bitcoinChains: bitcoinChains,
  cosmosChains: cosmosChains,
  // @ts-ignore
  chainTypes: chainTypeList as ChainType[],
  socialTypes: [],
  indexWallets: indexWalletIds,
  onlySocial: false,
  useServerSettings: false,
  chainOption: DefaultChainOption
} as TomoProviderSetting

export const tomoProviderSettingAtom =
  atom<TomoProviderSetting>(INIT_TOMO_SETTING)

export const tomoSDKAtom = atom<any | undefined>(undefined)

export type TomoModalState = {
  open: boolean
  resolve?: (value: ModalResult | undefined) => void
  chainType: ChainType
}
export const tomoModalAtom = atom<TomoModalState>({
  open: false,
  chainType: 'bitcoin'
})

export type Msg = {
  title: string
  duration?: number
  type?: 'success' | 'error' | 'warning' | 'info'
}

export type MsgState = Msg & {
  id: number
}

export const globalMsgListAtom = atom<MsgState[]>(INIT_ARRAY_STATE)

export const tomoStyleOptionAtom = atom({
  theme: 'light'
})
