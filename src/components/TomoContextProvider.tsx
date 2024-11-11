import { Provider } from 'jotai'
import { TomoProviderSetting } from '../state'
import '../main.css'
import { useWalletConnectInit } from '../hooks/useWalletConnect'
import TomoModal from './wallet/tomo-modal'
import useInitStyle from '../hooks/useInitStyle'

type TomoContextProviderProps = TomoProviderSetting & { children: any }

export default function TomoContextProvider({
  children,
  ...otherProps
}: TomoContextProviderProps) {
  return (
    <Provider>
      <InitFnCom otherProps={otherProps} />
      <TomoModal />
      {children}
    </Provider>
  )
}

function InitFnCom({ otherProps }: { otherProps: TomoProviderSetting }) {
  useWalletConnectInit(otherProps)
  useInitStyle(otherProps)
  return null
}
