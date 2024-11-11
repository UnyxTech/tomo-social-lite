import { useAtomValue } from 'jotai'
import { tomoSDKAtom } from '../state'

export const useTomoSDK = () => {
  return useAtomValue(tomoSDKAtom)
}
