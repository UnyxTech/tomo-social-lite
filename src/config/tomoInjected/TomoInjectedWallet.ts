import {
  BTCProvider,
  CosmosProvider,
  getWindow,
  ProviderOption,
  TomoBitcoinInjected,
  TomoCosmosInjected
} from '@tomo-inc/tomo-wallet-provider'

export type InjectedTomo = {
  info: {
    name: string
    logo: string
  }
  cosmos?: TomoCosmosInjected
  bitcoin?: TomoBitcoinInjected
}

class TomoInjectedBTCWallet extends BTCProvider {
  injectedTomo: InjectedTomo
  constructor(option: ProviderOption) {
    // @ts-ignore
    const injectedTomo = getWindow(option)?.injectedTomo as InjectedTomo
    const bitcoinNetworkProvider = injectedTomo?.bitcoin

    if (!bitcoinNetworkProvider) {
      throw new Error('Injected Tomo Wallet not found')
    }
    super(option, bitcoinNetworkProvider)
    tomoInjectedBtcWallet.img = injectedTomo.info.logo
    tomoInjectedBtcWallet.name = injectedTomo.info.name
    this.injectedTomo = injectedTomo
  }

  connectWallet = async (): Promise<this> => {
    const accounts = await this.bitcoinNetworkProvider?.requestAccounts()

    const address = accounts[0]
    const publicKeyHex = await this.getPublicKeyHex()

    if (!address || !publicKeyHex) {
      throw new Error('Could not connect to injected Wallet')
    }
    return this
  }

  getWalletProviderName(): Promise<string> {
    return Promise.resolve(this.injectedTomo?.info?.name)
  }
  getWalletProviderIcon(): Promise<string> {
    return Promise.resolve(this.injectedTomo?.info?.logo)
  }
}

class TomoInjectedCosmosWallet extends CosmosProvider {
  injectedTomo: InjectedTomo
  constructor(option: ProviderOption) {
    // @ts-ignore
    const injectedTomo = getWindow(option)?.injectedTomo as InjectedTomo
    const cosmosProvider = injectedTomo?.cosmos

    if (!cosmosProvider) {
      throw new Error('Injected Tomo Wallet not found')
    }
    super(option, cosmosProvider)
    tomoInjectedCosmosWallet.img = injectedTomo.info.logo
    tomoInjectedCosmosWallet.name = injectedTomo.info.name
    this.injectedTomo = injectedTomo
  }
  getWalletProviderName(): Promise<string> {
    return Promise.resolve(this.injectedTomo?.info?.name)
  }
  getWalletProviderIcon(): Promise<string> {
    return Promise.resolve(this.injectedTomo?.info?.logo)
  }
}

export const tomoInjectedBtcWallet = {
  id: 'bitcoin_tomo_auto',
  img: '',
  name: 'Tomo Injected',
  chainType: 'bitcoin',
  connectProvider: TomoInjectedBTCWallet,
  type: 'injected'
}

export const tomoInjectedCosmosWallet = {
  id: 'cosmos_tomo_auto',
  img: '',
  name: 'Tomo Injected',
  chainType: 'cosmos',
  connectProvider: TomoInjectedCosmosWallet,
  type: 'injected'
}
