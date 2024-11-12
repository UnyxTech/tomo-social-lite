import { CloseIcon } from '../icon/min-icon'
import { usePageControl } from '../../hooks/usePageService'
import { useState } from 'react'
import Button from '../Button'
import Checkbox from '../checkbox'
import { useAtomValue } from 'jotai/index'
import { TomoProviderSetting, tomoProviderSettingAtom } from '../../state'
import classNames from 'classnames'

export default function BtcConnectConfirm() {
  const pageControl = usePageControl()
  const tomoSetting = useAtomValue(tomoProviderSettingAtom)
  const defaultConfirms = [
    {
      isRequired: true,
      text: (
        <>
          I certify that I have read and accept the updated{' '}
          <a
            href={
              tomoSetting.uiOptions?.termsAndServiceUrl ||
              'https://tomo.inc/social/terms'
            }
            className={
              'tm-text-primary dark:tm-text-primary-dark tm-font-medium'
            }
            target={'_blank'}
            rel="noreferrer"
          >
            Terms of Use
          </a>{' '}
          and{' '}
          <a
            href={
              tomoSetting.uiOptions?.privacyPolicyUrl ||
              'https://tomo.inc/social/privacy'
            }
            className={
              'tm-text-primary dark:tm-text-primary-dark tm-font-medium'
            }
            target={'_blank'}
            rel="noreferrer"
          >
            Privacy Policy.
          </a>
          .
        </>
      )
    },
    {
      isRequired: true,
      text: 'I certify that there are no Bitcoin inscriptions tokens in my wallet.'
    },
    {
      isRequired: true,
      text: (
        <>
          I acknowledge that Keystone via QR code is the only hardware wallet
          supporting Bitcoin Staking. Using any other hardware wallets through
          any means (such as connection to software / extension / mobile wallet)
          can lead to permanent inability to withdraw the stake.
        </>
      )
    }
  ] as TomoProviderSetting['connectionHints']
  const curHints = tomoSetting.connectionHints || defaultConfirms!
  const [hintChecks, setHintChecks] = useState(
    curHints.map((hint) => !hint.isRequired)
  )
  return (
    <div className={'tm-flex tm-flex-col tm-gap-5 tm-p-5 tm-items-center'}>
      <div className="tm-text-center tm-positive">
        <div className="tm-text-tc1 dark:tm-text-tc1-dark tm-text-center tm-text-lg tm-font-medium">
          Confirm connection
        </div>
        <div
          className="tm-absolute tm-w-10 tm-right-4 tm-top-6 tm-size-[24px] tm-cursor-pointer"
          onClick={() => {
            pageControl.close(null)
          }}
        >
          <CloseIcon className="tm-size-3 tm-text-tc1 dark:tm-text-tc1-dark" />
        </div>
      </div>

      <div className={'tm-flex tm-flex-col tm-gap-3 tm-text-sm tm-w-full'}>
        {curHints.map((hint, index) => {
          if (hint.isRequired) {
            return (
              <div
                key={index}
                className={
                  'tm-flex tm-p-2.5 tm-rounded-lg tm-gap-2.5 tm-w-full'
                }
              >
                <div>
                  <Checkbox
                    check={hintChecks[index]}
                    onChange={() => {
                      const newHintChecks = [...hintChecks]
                      newHintChecks[index] = !newHintChecks[index]
                      setHintChecks(newHintChecks)
                    }}
                  />
                </div>
                <div className={'flex-1'}>{hint.text}</div>
              </div>
            )
          }
          return (
            <div
              key={index}
              className={classNames(
                'tm-flex tm-bg-mbg dark:tm-bg-[#282828] tm-rounded-lg tm-gap-2 tm-w-full',
                {
                  'tm-p-2.5': !hint.logo,
                  'tm-py-2.5 tm-px-1.5': !!hint.logo
                }
              )}
            >
              {hint.logo && <div>{hint.logo}</div>}
              <div className={'flex-1'}>{hint.text}</div>
            </div>
          )
        })}
      </div>

      <div className={'tm-w-10/12'}>
        <Button
          disabled={hintChecks.some((check) => !check)}
          primary
          onClick={() => {
            pageControl.close(true)
          }}
        >
          Connect
        </Button>
      </div>
    </div>
  )
}
