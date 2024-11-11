# @tomo-inc/wallet-connect-sdk

## What is inside?

### Install

```bash
npm install @tomo-inc/wallet-connect-sdk
```

```bash
yarn add @tomo-inc/wallet-connect-sdk
```

### Integration Guide
```javascript
import {
  TomoContextProvider,
  TomoSocial,
  useTomoProviders,
  useTomoModalControl,
  useTomoWalletConnect,
  useTomoWalletState
} from '@tomo-inc/wallet-connect-sdk'

export default function Demo() {
  return (
    <TomoContextProvider
      // optional
      style={{
        rounded: 'medium',
        theme: 'light',
        primaryColor: '#FF7C2A'
      }}
      // optional
      additionalWallets={[
        {
          id: 'xyz',
          name: 'XYZ BTC Wallet',
          chainType: 'bitcoin',
          connectProvider: XYZWallet,
          type: 'extension',
          img: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg'
        }
      ]}
      // optional
      indexWallets={[
        'bitcoin_okx',
        'bitcoin_unisat',
        'bitcoin_tomo',
        'bitcoin_onekey',
        'bitcoin_bitget',
        'bitcoin_keystone',
        'bitcoin_imtoken',
        'bitcoin_binance',
        'xyz'
      ]}
      // optional
      connectionHints={[
        {
          text: 'Subject to Developer’s compliance with the terms and conditions of this Agreement',
          logo: (
            <img className={'tm-size-5'} src={'https://tomo.inc/favicon.ico'} />
          )
        },
        {
          text: 'I certify that there are no Bitcoin inscriptions tokens in my wallet.'
        },
        {
          isRequired: true,
          text: (
            <span>
              I certify that I have read and accept the updated{' '}
              <a className={'tm-text-primary'}>Terms of Use</a> and{' '}
              <a className={'tm-text-primary'}>Privacy Policy</a>.
            </span>
          )
        }
      ]}

      // optional
      uiOptions={{
        termsAndServiceUrl: 'https://policies.google.com/terms',
        privacyPolicyUrl: 'https://policies.google.com/privacy'
      }}
    >
      <ChildComponent />
    </TomoContextProvider>
  )
}

export function ChildComponent() {
  const tomoModal = useTomoModalControl()
  const tomoWalletState = useTomoWalletState()
  const tomoClientMap = useTomoProviders()
  const tomoWalletConnect = useTomoWalletConnect()
  return (
    <div className={'tomo-social tm-flex tm-h-screen tm-w-screen'}>
      <div
        className={
          'tm-flex tm-h-full tm-flex-1 tm-flex-col tm-gap-4 tm-border-r tm-border-r-tc1/10 dark:tm-border-r-tc1-dark/10 tm-px-10 tm-py-10 tm-overflow-auto'
        }
      >
        <div className={'tm-flex tm-gap-3 tm-flex-wrap'}>
          <LodingButton
            onClick={async () => {
              await tomoModal.open('connect')
            }}
          >
            Connect
          </LodingButton>
          <LodingButton
            onClick={async () => {
              await tomoWalletConnect.disconnect()
            }}
          >
            Disconnect
          </LodingButton>
        </div>

        <ShowJson obj={tomoWalletState} title={'useTomoWalletState'} />
        <ShowJson obj={tomoClientMap} title={'useTomoProviders'} />
      </div>
      <div className={'tm-flex tm-flex-col tm-gap-4 tm-px-20 tm-py-10'}>
        <div>tomo social</div>
        <TomoSocial />
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
  return (
    <button
      {...otherProps}
    />
  )
}

function ShowJson({ title, obj, rows = 10 }) {
  const jsonFn = function jsonValueFn(key, value) {
    if (key && this !== obj) {
      return 'any'
    }
    return value
  }
  return (
    <div>
      <div>{title}: </div>
      <textarea
        value={JSON.stringify(obj, jsonFn, '\t')}
        className={'tm-w-full'}
        rows={rows}
      ></textarea>
    </div>
  )
}
```
