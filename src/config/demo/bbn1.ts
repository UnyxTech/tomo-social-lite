export const BBN_RPC_URL = 'https://babylon.nodes.guru/rpc/'

export const bbn1 = {
  chainId: 'bbn-1',
  chainName: 'Babylon Genesis',
  chainSymbolImageUrl:
    'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn/chain.png',
  rpc: BBN_RPC_URL,
  rest: 'https://babylon.nodes.guru/api',
  walletUrlForStaking: 'https://wallet.keplr.app/chains/babylon-genesis',
  bip44: {
    coinType: 118
  },
  bech32Config: {
    bech32PrefixAccAddr: 'bbn',
    bech32PrefixAccPub: 'bbnpub',
    bech32PrefixValAddr: 'bbnvaloper',
    bech32PrefixValPub: 'bbnvaloperpub',
    bech32PrefixConsAddr: 'bbnvalcons',
    bech32PrefixConsPub: 'bbnvalconspub'
  },
  currencies: [
    {
      coinDenom: 'BABY',
      coinMinimalDenom: 'ubbn',
      coinDecimals: 6,
      coinGeckoId: 'babylon',
      coinImageUrl:
        'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn/chain.png'
    },
    {
      coinDenom: 'LBTC',
      coinMinimalDenom:
        'ibc/89EE10FCF78800B572BAAC7080AEFA301B5F3BBC51C5371E907EB129C5B900E7',
      coinDecimals: 8,
      coinImageUrl:
        'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn/LBTC.png'
    }
  ],
  feeCurrencies: [
    {
      coinDenom: 'BABY',
      coinMinimalDenom: 'ubbn',
      coinDecimals: 6,
      coinGeckoId: 'babylon',
      coinImageUrl:
        'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn/chain.png',
      gasPriceStep: {
        low: 0.007,
        average: 0.007,
        high: 0.01
      }
    }
  ],
  stakeCurrency: {
    coinDenom: 'BABY',
    coinMinimalDenom: 'ubbn',
    coinDecimals: 6,
    coinGeckoId: 'babylon',
    coinImageUrl:
      'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn/chain.png'
  },
  features: ['cosmwasm']
}
