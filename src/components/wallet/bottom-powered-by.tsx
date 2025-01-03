import tomoGreyIcon from '../../assets/img/icon/tomo_grey.svg'
import tomoGreyBlackIcon from '../../assets/img/icon/tomo_grey_black.svg'
import { useAtomValue } from 'jotai'
import { tomoProviderSettingAtom, tomoStyleOptionAtom } from '../../state'

export function BottomPoweredBy() {
  const { theme } = useAtomValue(tomoStyleOptionAtom)
  return (
    <div
      className={
        'tm-flex tm-gap-2 tm-pb-2.5 tm-text-xs tm-text-tc4 dark:tm-text-tc4-dark'
      }
    >
      <div>Powered by</div>
      <img
        alt={'tomo'}
        src={theme === 'dark' ? tomoGreyIcon : tomoGreyBlackIcon}
      />
    </div>
  )
}

export function BottomInfo() {
  const tomoSetting = useAtomValue(tomoProviderSettingAtom)
  return (
    <div
      className={
        'tm-flex tm-flex-col tm-items-center tm-gap-2 tm-text-center tm-text-xs tm-text-tc4 dark:tm-text-tc4-dark'
      }
    >
      <div>
        By logging in, you agree to our{' '}
        <a
          href={
            tomoSetting.uiOptions?.termsAndServiceUrl ||
            'https://tomo.inc/social/terms'
          }
          className={'tm-text-[#1356F0] tm-no-underline'}
          target={'_blank'}
          rel="noreferrer"
        >
          Terms of Service
        </a>{' '}
        &{' '}
        <a
          href={
            tomoSetting.uiOptions?.privacyPolicyUrl ||
            'https://tomo.inc/social/privacy'
          }
          className={'tm-text-[#1356F0] tm-no-underline'}
          target={'_blank'}
          rel="noreferrer"
        >
          Privacy Policy.
        </a>
      </div>
      <BottomPoweredBy />
    </div>
  )
}
