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
import {
  CosmosProvider,
  TomoChain,
  WalletProvider
} from '@tomo-inc/tomo-wallet-provider'
import { DefaultChainOption } from '../config/chain-base'
import update from 'immutability-helper'

export function getSettingChains(
  tomoSetting: TomoProviderSetting,
  chainType: ChainType
) {
  return tomoSetting[chainType + 'Chains'] as TomoChain[]
}

export default function useWalletConnect() {
  const setWalletState = useSetAtom(walletStateAtom)
  const setClientMap = useSetAtom(clientMapAtom)

  const reloadAddress = useAtomCallback(
    useCallback(async (get, set, opt: { chainType: ChainType }) => {
      const { chainType } = opt
      const clientMap = get(clientMapAtom)
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
        opt?: { type?: 'connect' | 'init' } = {}
      ) => {
        const { type = 'connect' } = opt
        const clientMap = get(clientMapAtom)
        const tomoSetting = get(tomoProviderSettingAtom)

        try {
          const provider = clientMap[`${chainType}Provider`] as WalletProvider
          if (!provider) {
            throw new Error(`Unsupported Chain: ${chainType}`)
          }
          try {
            await provider.connectWallet()
          } catch (e) {
            // cosmos chain not found
            if (
              chainType !== 'cosmos' ||
              !/There is no modular chain info for/.test(e.message || '')
            ) {
              throw e
            }
            const data = tomoSetting.cosmosChains[0].modularData
            if (!data) {
              throw e
            }
            await (
              provider as CosmosProvider
            ).provider.experimentalSuggestChain(data)
            await provider.connectWallet()
          }

          const network = await provider.getNetwork()

          let chain = tomoSetting[`${chainType}Chains`].find(
            (item) => item.network === network
          )
          // no support chain
          if (!chain) {
            const chainList = getSettingChains(tomoSetting, chainType)
            if (!chainList?.length) {
              throw new Error('Unsupported network')
            }
            chain = chainList[0]
            await switchChain(chain)
            return
          }

          await reloadAddress({ chainType: chainType })
          setWalletState((prev) => {
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
      const walletState = get(walletStateAtom)
      const clientMap = get(clientMapAtom)
      // if (walletState.chainType !== chain.type) {
      //   await switchChainType(chain.type)
      // }
      const newWalletState = {} as WalletState
      const provider = clientMap[`${chain.type}Provider`] as WalletProvider
      if (!provider) {
        throw new Error(`chain type error: ${chain.type}`)
      }

      await provider.switchNetwork(chain.network)

      const address = await provider?.getAddress()
      const network = await provider?.getNetwork()

      setWalletState((prev) => {
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

      const provider = (newClientMap[`${wallet.chainType}Provider`] =
        new wallet.connectProvider(
          tomoProviderSetting[`${wallet.chainType}Chains`]
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
        for (let walletId of walletIds) {
          const wallet = getWalletById(walletId, tomoSetting)
          if (!wallet) {
            throw new Error('Wallet does not exist')
          }
          setWalletState((prev) => {
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
          setWalletState((prev) => {
            return update(prev, {
              [wallet.chainType]: {
                $merge: {
                  connected: true
                }
              }
            })
          })
        }
        setWalletState((prev) => {
          return {
            ...prev,
            isConnected: true
          }
        })
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
  tomoSetting.chainTypes.forEach((type) => {
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
  const [walletState, setWalletState] = useAtom(walletStateAtom)
  const [clientMap, setClientMap] = useAtom(clientMapAtom)
  const walletConnect = useWalletConnect()
  const setInstallWallet = useSetAtom(installWalletsAtom)
  useEffect(() => {
    getInstalledWallet(setInstallWallet)
  }, [])

  const initConnectState = useAtomCallback(
    useCallback(async (get, set) => {
      // save opt
      let tomoSetting = {
        ...get(tomoProviderSettingAtom),
        ...opt,
        chainOption: { ...DefaultChainOption, ...opt.chainOption }
      } as TomoProviderSetting

      chainTypeList.forEach((type) => {
        tomoSetting[`${type}Chains`] = initSettingChains(
          tomoSetting[`${type}Chains`]
        )
      })
      set(walletStateAtom, (prev) => {
        return initWalletState(prev, tomoSetting)
      })

      set(tomoProviderSettingAtom, tomoSetting)

      // init wallet state
      const walletState = get(walletStateAtom)
      tomoSetting.chainTypes?.forEach((chainType) => {
        const walletId = walletState[chainType].walletId
        if (walletId) {
          const wallet = getWalletById(walletId, tomoSetting)
          if (wallet) {
            try {
              new wallet.connectProvider(tomoSetting[`${chainType}Chains`])
            } catch (e) {}
          }
        }
      })
      if (walletState.isConnected) {
        try {
          if (
            tomoSetting.chainTypes?.some((type) => {
              return !walletState[type].connected
            })
          ) {
            throw new Error(`chain not connected`)
          }
          const connectChainTypes = tomoSetting.chainTypes

          for (let type of connectChainTypes) {
            const walletId = walletState[type].walletId
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
        }
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
  const chainChange = useCallback(
    useAtomCallback(async (get, set, chainId: string) => {
      const tomoSetting = get(tomoProviderSettingAtom)
      const walletState = get(walletStateAtom)
      chainId = Number(chainId)

      const chainList = getSettingChains(tomoSetting, walletState.chainType)
      if (!chainList?.length) {
        await walletConnect.disconnect()
        return
      }
      let chain = chainList.find((c) => c.id === chainId)
      if (!chain) {
        chain = chainList.find((c) => c.id === walletState.chainId)
        if (!chain) {
          chain = chainList[0]
        }
      }
      // console.log('chainChanged', chain)
      await walletConnect.switchChain(chain)
    }),
    []
  )
  useEffect(() => {
    const accountChanged = async (...args) => {
      await walletConnect.reloadAddress({ chainType: 'bitcoin' })
    }
    clientMap.bitcoinProvider?.on?.('accountsChanged', accountChanged)
    return () => {
      clientMap.bitcoinProvider?.off?.('accountsChanged', accountChanged)
    }
  }, [clientMap.evmProvider, clientMap.bitcoinProvider])

  return null
}
