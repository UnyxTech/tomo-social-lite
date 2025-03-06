import { getWalletById } from '../config/all-wallets'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  ChainType,
  chainTypeList,
  ClientMap,
  clientMapAtom,
  INIT_ARRAY_STATE,
  INIT_WALLET_STATE,
  installWalletsAtom,
  TomoProviderSetting,
  tomoProviderSettingAtom,
  WalletState,
  walletStateAtom
} from '../state'
import { useCallback, useEffect } from 'react'
import { useAtomCallback } from 'jotai/utils'
import { CosmosProvider, WalletProvider } from '@tomo-inc/tomo-wallet-provider'
import { DefaultChainOption, TomoChain } from '../config/chain-base'
import update from 'immutability-helper'

const cosmosAutoAddChainRules = [
  {
    wallet: 'cosmos_keplr',
    messageRegex: /There is no modular chain info for/
  },
  {
    wallet: 'cosmos_leap',
    messageRegex: /Invalid chain id/
  },
  {
    wallet: 'cosmos_cosmostation',
    messageRegex: /There is no chain info for/
  }
]

export function getSettingChains(
  tomoSetting: TomoProviderSetting,
  chainType: ChainType
) {
  // @ts-ignore
  return tomoSetting[chainType + 'Chains'] as TomoChain[]
}

export default function useWalletConnect() {
  const setWalletState = useSetAtom(walletStateAtom)
  const setClientMap = useSetAtom(clientMapAtom)

  const reloadAddress = useAtomCallback(
    useCallback(async (get, set, opt: { chainType: ChainType }) => {
      const { chainType } = opt
      const clientMap = get(clientMapAtom)
      // @ts-ignore
      const provider = clientMap[`${chainType}Provider`] as WalletProvider
      const address = await provider.getAddress()

      setWalletState((prev) => {
        return update(prev, {
          [chainType]: {
            address: {
              $set: address
            }
          }
        })
      })
    }, [])
  )

  const switchChainType = useAtomCallback(
    useCallback(
      async (
        get,
        set,
        chainType: ChainType,
        opt: { type?: 'connect' | 'init' } = {}
      ) => {
        const { type = 'connect' } = opt
        const clientMap = get(clientMapAtom)
        const tomoSetting = get(tomoProviderSettingAtom)
        const walletState = get(walletStateAtom)

        try {
          // @ts-ignore
          const provider = clientMap[`${chainType}Provider`] as WalletProvider
          if (!provider) {
            throw new Error(`Unsupported Chain: ${chainType}`)
          }
          try {
            await provider.connectWallet()
          } catch (e: any) {
            if (
              chainType !== 'cosmos' ||
              // @ts-ignore
              !provider?.provider?.experimentalSuggestChain
            ) {
              throw e
            }
            // cosmos chain not found

            const autoRule = cosmosAutoAddChainRules.find((rule) => {
              return rule.wallet === walletState.cosmos?.walletId
            })
            if (!autoRule || !autoRule.messageRegex.test(e.message || '')) {
              throw e
            }
            const data = tomoSetting.cosmosChains![0].modularData
            if (!data) {
              throw e
            }
            await (provider as CosmosProvider).provider
              .experimentalSuggestChain!(data)
            await provider.connectWallet()
          }

          const network = await provider.getNetwork()

          // @ts-ignore
          let chain = tomoSetting[`${chainType}Chains`].find(
            (item: TomoChain) => item.network === network
          )
          // no support chain
          if (!chain) {
            const chainList = getSettingChains(tomoSetting, chainType)
            if (!chainList?.length) {
              throw new Error('Unsupported network')
            }
            chain = chainList[0]! as TomoChain
            await switchChain(chain)
            return
          }

          await reloadAddress({ chainType: chainType })
          setWalletState((prev: WalletState) => {
            return update(prev, {
              [chainType]: {
                $merge: {
                  network: network,
                  chainId: chain.id
                }
              }
            })
          })
        } catch (e) {
          console.log('switchChainType error', e)
          throw e
        }
      },
      []
    )
  )

  const switchChain = useAtomCallback(
    useCallback(async (get, set, chain: TomoChain) => {
      const clientMap = get(clientMapAtom)
      // @ts-ignore
      const provider = clientMap[`${chain.type}Provider`] as WalletProvider
      // @ts-ignore
      if (!provider || !provider.switchNetwork) {
        throw new Error(`switchNetwork error: ${chain.type}`)
      }

      // @ts-ignore
      await provider.switchNetwork(chain.network)

      const address = await provider?.getAddress()
      const network = await provider?.getNetwork()

      setWalletState((prev: WalletState) => {
        return update(prev, {
          [chain.type]: {
            $merge: {
              network: network,
              chainId: chain.id,
              address: address
            }
          }
        })
      })
    }, [])
  )

  const initProvider = useAtomCallback(
    useCallback((get, set, walletId: string) => {
      const tomoProviderSetting = get(tomoProviderSettingAtom)
      const newClientMap = {} as ClientMap

      const wallet = getWalletById(walletId, tomoProviderSetting)
      if (!wallet) {
        throw new Error('Wallet does not exist')
      }

      // @ts-ignore
      const provider = (newClientMap[`${wallet.chainType}Provider`] =
        new wallet.connectProvider(
          // @ts-ignore
          {
            chains: tomoProviderSetting[`${wallet.chainType}Chains`],
            ...tomoProviderSetting.providerOptions
          }
        ))

      setClientMap((prev) => {
        return {
          ...prev,
          ...newClientMap
        }
      })
      return provider
    }, [])
  )

  return {
    initProvider,
    switchChainType,
    switchChain,
    reloadAddress,
    disconnect: useAtomCallback(
      useCallback(async (get, set) => {
        const tomoProviderSetting = get(tomoProviderSettingAtom)
        setWalletState(initWalletState(INIT_WALLET_STATE, tomoProviderSetting))
      }, [])
    ),
    connect: useAtomCallback(
      useCallback(async (get, set, walletIds: string[]) => {
        const tomoSetting = get(tomoProviderSettingAtom)
        for (const walletId of walletIds) {
          const wallet = getWalletById(walletId, tomoSetting)
          if (!wallet) {
            throw new Error('Wallet does not exist')
          }
          setWalletState((prev: WalletState) => {
            return update(prev, {
              [wallet.chainType]: {
                $merge: {
                  walletId: walletId
                }
              }
            })
          })
          initProvider(walletId)
          await switchChainType(wallet.chainType)
          setWalletState((prev: WalletState) => {
            return update(prev, {
              [wallet.chainType]: {
                $merge: {
                  connected: true
                }
              }
            })
          })
        }
        const walletState = get(walletStateAtom)
        if (
          tomoSetting.chainTypes?.every((type) => {
            return walletState[type].connected
          })
        ) {
          setWalletState((prev: WalletState) => {
            return {
              ...prev,
              isConnected: true
            }
          })
        }
      }, [])
    )
  }
}

const getInstalledWallet = (setInstallWallet: any) => {
  const windowObj: any = window
  if (windowObj.ethereum) {
    let wallets: any = []
    const getInstalledWallets = (event: any) => {
      const arr = [event.detail]
      wallets = wallets.concat(arr)
      if (wallets) {
        setInstallWallet(wallets)
      } else {
        setInstallWallet([])
      }
    }

    window.addEventListener('eip6963:announceProvider', getInstalledWallets)
    window.dispatchEvent(new Event('eip6963:requestProvider'))
    window.removeEventListener('eip6963:announceProvider', getInstalledWallets)
  } else {
    setInstallWallet([])
  }
}

function initSettingChains(ethChains: TomoChain[]) {
  if (!ethChains) {
    return []
  }
  return ethChains?.map((item) => {
    return item
  }) as TomoChain[]
}

function initWalletState(
  walletSate: WalletState,
  tomoSetting: TomoProviderSetting
) {
  let newState = walletSate
  tomoSetting.chainTypes!.forEach((type) => {
    if (!newState[type]) {
      newState = {
        ...newState,
        [type]: {
          connected: false,
          chainType: type
        }
      }
    }
  })
  return newState
}

export function useWalletConnectInit(opt: TomoProviderSetting) {
  const installWallets = useAtomValue(installWalletsAtom)
  const walletConnect = useWalletConnect()
  const setInstallWallet = useSetAtom(installWalletsAtom)
  useEffect(() => {
    getInstalledWallet(setInstallWallet)
  }, [])

  const initConnectState = useAtomCallback(
    useCallback(async (get, set) => {
      // save opt
      const tomoSetting = {
        ...get(tomoProviderSettingAtom),
        ...opt
      } as TomoProviderSetting

      chainTypeList.forEach((type) => {
        // @ts-ignore
        tomoSetting[`${type}Chains`] = initSettingChains(
          // @ts-ignore
          tomoSetting[`${type}Chains`]
        )
      })
      set(walletStateAtom, (prev) => {
        return initWalletState(prev, tomoSetting)
      })

      set(tomoProviderSettingAtom, tomoSetting)

      const resetLogout = () => {
        set(walletStateAtom, (prev) => {
          tomoSetting.chainTypes?.forEach((type) => {
            prev = update(prev, {
              [type]: {
                connected: {
                  $set: false
                }
              }
            })
          })
          return {
            ...prev,
            isConnected: false
          }
        })
      }

      // init wallet state
      const walletState = get(walletStateAtom)
      tomoSetting.chainTypes?.forEach((chainType) => {
        const walletId = walletState[chainType].walletId
        if (walletId) {
          const wallet = getWalletById(walletId, tomoSetting)
          if (wallet) {
            try {
              // @ts-ignore
              new wallet.connectProvider({
                chains: tomoSetting[`${chainType}Chains`],
                ...tomoSetting.providerOptions
              })
            } catch (e) {
              /* empty */
            }
          }
        }
      })
      if (walletState.isConnected && tomoSetting.autoReconnect !== false) {
        try {
          if (
            tomoSetting.chainTypes?.some((type) => {
              return !walletState[type].connected
            })
          ) {
            throw new Error(`chain not connected`)
          }
          const connectChainTypes = tomoSetting.chainTypes!

          for (const type of connectChainTypes) {
            const walletId = walletState[type].walletId!
            walletConnect.initProvider(walletId)
            await walletConnect.switchChainType(type, {
              type: 'init'
            })
          }
        } catch (e) {
          console.log('init connect error', e)
          set(walletStateAtom, (prev) => {
            return {
              ...prev,
              isConnected: false
            }
          })
          resetLogout()
        }
      } else {
        resetLogout()
      }
      set(clientMapAtom, (prev) => {
        return {
          ...prev,
          state: 1
        }
      })
    }, [])
  )
  useEffect(() => {
    if (installWallets !== INIT_ARRAY_STATE) {
      initConnectState()
    }
  }, [installWallets])

  return null
}

export function useWatchAccountChange() {
  const clientMap = useAtomValue(clientMapAtom)
  const walletConnect = useWalletConnect()
  const walletState = useAtomValue(walletStateAtom)
  useEffect(() => {
    if (!walletState.bitcoin.connected) {
      return
    }

    const accountChanged = async () => {
      await walletConnect.reloadAddress({ chainType: 'bitcoin' })
    }
    clientMap.bitcoinProvider?.on?.('accountsChanged', accountChanged)
    return () => {
      clientMap.bitcoinProvider?.off?.('accountsChanged', accountChanged)
    }
  }, [clientMap.bitcoinProvider, walletState.bitcoin.connected])

  useEffect(() => {
    if (!walletState.cosmos.connected) {
      return
    }
    const accountChanged = async () => {
      await walletConnect.reloadAddress({ chainType: 'cosmos' })
    }
    clientMap.cosmosProvider?.on?.('accountChanged', accountChanged)
    return () => {
      clientMap.cosmosProvider?.off?.('accountChanged', accountChanged)
    }
  }, [clientMap.cosmosProvider, walletState.cosmos.connected])
}
