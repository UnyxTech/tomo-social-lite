import {
  tomoBitcoin,
  tomoBitcoinSignet,
  TomoContextProvider,
  TomoSocial,
  useTomoModalControl,
  useTomoProps,
  useTomoProviders,
  useTomoWalletConnect,
  useTomoWalletState,
  useWalletList
} from '../main'
import { useLoading } from '../hooks/useLoading'
import React, { useEffect, useState } from 'react'
import { TomoProviderSetting } from '../state'
import { SigningStargateClient } from '@cosmjs/stargate'
import { allWalletMap } from '../config/all-wallets'
import bbnTest from '../config/demo/bbn-test.json'

// window.verifyMsg = (message, address, signature, publicKey) => {
//   return verifySimple(message, address, signature, publicKey)
// }
// window.injectedTomo = {
//   info: {
//     name: 'Tomo Inject xxx',
//     logo: 'https://logincdn.msauth.net/16.000.30389.5/images/favicon.ico'
//   },
//   bitcoin: window.unisat,
//   cosmos: window.keplr
// }

export default function Demo() {
  const [style, setStyle] = useState<TomoProviderSetting['style']>({
    rounded: 'small',
    theme: 'light',
    primaryColor: '#FF7C2A'
  })
  const isChildren = window.parent !== window
  if (!isChildren) {
    return (
      <iframe
        className={'tm-w-screen tm-h-screen tm-border-none tm-absolute'}
        src={'/'}
      />
    )
  }
  return (
    <TomoContextProvider
      providerOptions={{
        getWindow() {
          return window.parent
        }
      }}
      // chainTypes={['bitcoin']}
      // cosmosChains={[
      //   {
      //     id: 2,
      //     name: 'Babylon',
      //     type: 'cosmos',
      //     network: 'bbn-test-3',
      //     modularData: bbnTest,
      //     backendUrls: {
      //       rpcUrl: 'https://rpc.testnet3.babylonchain.io'
      //     }
      //   }
      // ]}
      // bitcoinChains={[
      //   {
      //     ...tomoBitcoin,
      //     backendUrls: {
      //       inscriptionUrl: 'https://inscriptions.xxx.io/api',
      //       mempoolUrl: 'https://mempool.testnet.xxx.io/api'
      //     }
      //   }
      // ]}
      style={style}
      // indexWallets={[
      //   'bitcoin_okx',
      //   'bitcoin_unisat',
      //   'bitcoin_tomo',
      //   'bitcoin_onekey',
      //   'bitcoin_bitget',
      //   'bitcoin_keystone',
      //   'bitcoin_imtoken',
      //   'bitcoin_binance',
      //   'xxx'
      // ]}
      // additionalWallets={[
      //   {
      //     id: 'bitcoin_xxx',
      //     name: 'xxx-xxx bitcoin',
      //     chainType: 'bitcoin',
      //     connectProvider: TomoTestWallet,
      //     type: 'extension',
      //     img: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg'
      //   }
      // ]}
    >
      <ChildComponent style={style} setStyle={setStyle} />
    </TomoContextProvider>
  )
}

type ChildProps = {
  style: TomoProviderSetting['style']
  setStyle: (v: TomoProviderSetting['style']) => void
}
export function ChildComponent(props: ChildProps) {
  const tomoModal = useTomoModalControl()
  const tomoWalletState = useTomoWalletState()
  const providers = useTomoProviders()
  const tomoProps = useTomoProps()
  const tomoWalletConnect = useTomoWalletConnect()
  const walletList = useWalletList()

  const signCosmos = async (address: string, amount: string) => {
    if (!providers.cosmosProvider) {
      throw new Error('cosmosProvider not found')
    }
    const selfAddress = await providers.cosmosProvider.getAddress()
    const rpcUrl = 'https://cosmoshub.validator.network:443'
    const client = await SigningStargateClient.connectWithSigner(
      rpcUrl,
      providers.cosmosProvider!.offlineSigner!
    )

    const result = await client.sendTokens(
      selfAddress,
      address,
      [
        {
          denom: 'uatom',
          amount: amount
        }
      ],
      {
        amount: [{ denom: 'uatom', amount: '500' }],
        gas: '200000'
      }
    )
    console.log('result', result)
  }

  return (
    <div className={'tomo-social tm-flex tm-h-full tm-w-full tm-text-sm'}>
      <div className={'tomo-social tm-flex tm-h-screen tm-w-screen tm-text-sm'}>
        <div
          className={
            'tm-hidden tm-h-full tm-flex-col tm-gap-4 tm-overflow-auto tm-border-r tm-border-r-tc1/10 tm-p-10 md:tm-flex md:tm-flex-1'
          }
        >
          <div className={'tm-flex tm-flex-wrap tm-gap-3'}>
            <LodingButton
              onClick={() => {
                tomoModal.open('cosmos')
              }}
            >
              tomo modal - cosmos
            </LodingButton>

            <LodingButton
              onClick={async () => {
                const result = await tomoModal.open('bitcoin')
                console.log('modal result', result)
              }}
            >
              tomo modal - bitcoin
            </LodingButton>
            <LodingButton
              onClick={async () => {
                await tomoWalletConnect.disconnect()
              }}
            >
              disconnect
            </LodingButton>

            <div className={'tm-w-full'} />
            <LodingButton
              onClick={async () => {
                await signCosmos(
                  'cosmos15u0f6rszd07zgekvf4sy580aslsp00j52ww09r',
                  '10000'
                )
              }}
            >
              signCosmos
            </LodingButton>

            <LodingButton
              onClick={async () => {
                const result =
                  await providers.cosmosProvider?.getBalance('uatom')
                console.log('cosmos balance', result)
              }}
            >
              cosmosProvider.getBalance('uatom')
            </LodingButton>

            <LodingButton
              onClick={async () => {
                const result =
                  await providers.cosmosProvider?.getBalance('ubbn')
                console.log('cosmos balance', result)
              }}
            >
              cosmosProvider.getBalance('ubbn')
            </LodingButton>
            <div className={'tm-w-full'} />
            <LodingButton
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.getBalance()
                  console.log('btc balance', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getBalance()
            </LodingButton>

            <LodingButton
              onClick={async () => {
                try {
                  const result =
                    await providers.bitcoinProvider?.getInscriptions()
                  console.log('btc getInscriptions', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getInscriptions()
            </LodingButton>
            <LodingButton
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.getUtxos(
                    await providers.bitcoinProvider?.getAddress()
                  )
                  console.log('btc getUtxos', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getUtxos()
            </LodingButton>
            <LodingButton
              onClick={async () => {
                try {
                  const result =
                    await providers.bitcoinProvider?.getBTCTipHeight()
                  console.log('btc getBTCTipHeight', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getBTCTipHeight()
            </LodingButton>

            <LodingButton
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.signMessage(
                    '11',
                    'ecdsa'
                  )
                  console.log('btc signMessage ecdsa', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc signMessage('11', 'ecdsa')
            </LodingButton>

            <LodingButton
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.signMessage(
                    '11',
                    'bip322-simple'
                  )
                  console.log('btc signMessage bip322-simple', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc signMessage('11', 'bip322-simple')
            </LodingButton>
          </div>
          <StyleSetting {...props} />

          <ShowJson obj={tomoWalletState} title={'useTomoWalletState'} />
          <ShowJson obj={providers} title={'useTomoProviders'} />
          <ShowJson obj={tomoProps} title={'useTomoProps'} />
          <ShowJson obj={walletList} title={'useWalletList'} />
        </div>
        <div
          className={
            'tm-flex tm-h-full tm-w-full tm-flex-col tm-items-center tm-gap-4 tm-overflow-auto tm-px-4 tm-py-10 md:tm-w-auto md:tm-px-6'
          }
        >
          <div>tomo social</div>
          <div>
            <LodingButton
              onClick={() => {
                tomoModal.open('bitcoin')
              }}
            >
              open modal
            </LodingButton>
            <LodingButton
              onClick={async () => {
                await tomoWalletConnect.disconnect()
              }}
            >
              disconnect
            </LodingButton>
          </div>

          <TomoSocial chainType={'bitcoin'} />
        </div>
      </div>
    </div>
  )
}

function StyleSetting({ style, setStyle }: ChildProps) {
  return (
    <div className={'tm-flex tm-gap-4'}>
      <div>style</div>
      <div>
        <div>rounded</div>
        <select
          value={style?.rounded}
          onChange={(e) => {
            setStyle({
              ...style,
              // @ts-ignore
              rounded: e.target.value
            })
          }}
        >
          <option>none</option>
          <option>small</option>
          <option>medium</option>
          <option>large</option>
        </select>
      </div>
      <div>
        <div>theme</div>
        <div>
          <LodingButton
            onClick={(e) => {
              setStyle({
                ...style,
                theme: 'light'
              })
            }}
          >
            light
          </LodingButton>
          <LodingButton
            onClick={(e) => {
              setStyle({
                ...style,
                theme: 'dark'
              })
            }}
          >
            dark
          </LodingButton>
        </div>
      </div>
      <div>
        <div>primary</div>
        <div>
          <select
            value={style?.primaryColor}
            onChange={(e) => {
              setStyle({
                ...style,
                primaryColor: e.target.value
              })
            }}
          >
            <option value={'#121212'}>default</option>
            <option value={'#FF7C2A'}>#FF7C2A</option>
            <option value={'#F21F7F'}>#F21F7F</option>
            <option value={'#fcd535'}>#fcd535</option>
            <option value={'#4285f4'}>#4285f4</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function LodingButton({
  onClick,
  disabled,
  ...otherProps
}: React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>) {
  const [loading, loadingFn] = useLoading()
  return (
    <button
      {...otherProps}
      className={'tm-border tm-border-tc1 tm-px-1.5'}
      disabled={loading || disabled}
      onClick={async () => {
        // @ts-ignore
        await loadingFn(onClick)
      }}
    />
  )
}

const ShowJson = React.memo(function ShowJson({
  title,
  obj,
  rows = 10
}: {
  title: any
  obj: any
  rows?: number
}) {
  const jsonFn = function jsonValueFn(key: any, value: any) {
    // @ts-ignore
    if (key && this !== obj) {
      if (typeof value === 'object' || typeof value === 'function') {
        if (Array.isArray(value)) {
          return `Array(${value.length})`
        }
        return 'object'
      }
      return value
    }
    return value
  }
  return (
    <div>
      <div>{title}: </div>
      <textarea
        value={JSON.stringify(obj, jsonFn, '\t')}
        className={'tm-w-full tm-border tm-px-1'}
        rows={rows}
        readOnly
      ></textarea>
    </div>
  )
})
