import TomoContextProvider from './components/TomoContextProvider'
import { useTomoModalControl } from './components/wallet/tomo-modal'
import { useAtomValue } from 'jotai'
import {
  clientMapAtom,
  tomoProviderSettingAtom,
  walletStateAtom
} from './state'
import useWalletConnect from './hooks/useWalletConnect'
import { TomoSocial } from './components/wallet/tomo-social'
import { indexWalletIds } from 'config/all-wallets'
import { BTCProvider, CosmosProvider } from '@tomo-inc/tomo-wallet-provider'

function useTomoWalletState() {
  return useAtomValue(walletStateAtom)
}

function useTomoProviders() {
  return useAtomValue(clientMapAtom)
}

function useTomoProps() {
  return useAtomValue(tomoProviderSettingAtom)
}

function useTomoWalletConnect() {
  const walletConnect = useWalletConnect()
  return {
    switchChainType: walletConnect.switchChainType,
    disconnect: walletConnect.disconnect,
    switchChain: walletConnect.switchChain
  }
}

export {
  TomoSocial,
  TomoContextProvider,
  useTomoWalletState,
  useTomoProviders,
  useTomoWalletConnect,
  useTomoModalControl,
  useTomoProps,
  indexWalletIds,
  BTCProvider,
  CosmosProvider
}

export { tomoBitcoin, tomoBitcoinSignet } from 'config/chain-base'
