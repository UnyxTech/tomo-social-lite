import logoBTC from '../assets/img/chain/btc.svg'
import logoSignet from '../assets/img/chain/signet.svg'
import logoCosmos from '../assets/img/chain/cosmos.svg'
import { ChainType } from '../state'
import {
  TomoChainCosmos as ChainCosmos,
  TomoChainBTC as ChainBTC,
  TomoChain as Chain
} from '@tomo-inc/tomo-wallet-provider'

export type TomoChain = Chain & {
  id: number
  name: string
  type: ChainType
  logo?: string
}

export type TomoChainBTC = TomoChain & ChainBTC

export type TomoChainCosmos = TomoChain & ChainCosmos & { modularData?: any }

export type TomoChainOption = Partial<
  Record<
    ChainType,
    {
      id: ChainType
      name: string
      logo: string
      darkLogo?: string
    }
  >
>

export const DefaultChainOption = {
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin',
    logo: logoBTC
  },
  cosmos: {
    id: 'cosmos',
    name: 'Cosmos',
    logo: logoCosmos
  }
} as TomoChainOption

export const tomoBitcoin: TomoChainBTC = {
  id: 1,
  name: 'Bitcoin',
  network: 'mainnet',
  type: 'bitcoin',
  logo: logoBTC
}

export const tomoBitcoinSignet: TomoChainBTC = {
  id: 2,
  name: 'Bitcoin Signet',
  type: 'bitcoin',
  network: 'signet',
  logo: logoSignet
}

export const tomoCosmos: TomoChainCosmos = {
  id: 1,
  name: 'Cosmos',
  type: 'cosmos',
  network: 'cosmoshub-4',
  logo: logoCosmos
}
