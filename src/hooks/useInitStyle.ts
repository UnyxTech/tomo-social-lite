import {
  INIT_TOMO_SETTING,
  TomoProviderSetting,
  tomoProviderSettingAtom,
  tomoStyleOptionAtom
} from '../state'
import { useEffect } from 'react'
import { useAtom, useSetAtom } from 'jotai'

const INIT_STYLE = {
  rounded: 'medium',
  theme: 'light',
  primaryColor: '#121212'
}

const STYLE_MAP = {
  rounded: {
    sizeList: [
      ['--tms-rounded', 4],
      ['--tms-rounded-md', 6],
      ['--tms-rounded-lg', 8],
      ['--tms-rounded-xl', 12],
      ['--tms-rounded-2xl', 16],
      ['--tms-rounded-3xl', 24],
      ['--tms-rounded-full', 9999]
    ] as [string, number][],
    scale: {
      none: 0,
      small: 0.5,
      medium: 1,
      large: 2
    }
  }
}

export default function useInitStyle(tomoSetting: TomoProviderSetting) {
  const [tomoSettingState, setTomoSetting] = useAtom(tomoProviderSettingAtom)
  const setTomoStyleOption = useSetAtom(tomoStyleOptionAtom)
  const resultStyle = {
    ...INIT_STYLE,
    ...tomoSetting.style
  } as TomoProviderSetting['style']

  const resultUIOption =
    tomoSetting.uiOptions as TomoProviderSetting['uiOptions']

  useEffect(() => {
    setTomoSetting((prev) => {
      return { ...prev, uiOptions: resultUIOption }
    })
  }, [JSON.stringify(resultUIOption)])

  useEffect(() => {
    STYLE_MAP.rounded.sizeList.forEach(([varName, size]) => {
      // @ts-ignore
      let scale = STYLE_MAP.rounded.scale[resultStyle?.rounded]
      if (isNaN(scale)) {
        scale = STYLE_MAP.rounded.scale.medium
      }
      document.documentElement.style.setProperty(varName, `${size * scale}px`)
    })
  }, [resultStyle?.rounded])
  useEffect(() => {
    if (resultStyle?.theme === 'dark') {
      document.documentElement.classList.add('tm-dark')
    } else {
      document.documentElement.classList.remove('tm-dark')
    }
    setTomoStyleOption({ theme: resultStyle?.theme === 'dark' ? 'dark' : 'light' })
  }, [resultStyle?.theme])

  useEffect(() => {
    const isDefault =
      !resultStyle?.primaryColor ||
      resultStyle?.primaryColor.toLowerCase() === INIT_STYLE.primaryColor
    console.log('isDefault', isDefault, resultStyle?.primaryColor)
    document.documentElement.style.setProperty(
      '--tms-colors-primary-btn-text-dark',
      isDefault ? '#121212' : '#ffffff'
    )
    document.documentElement.style.setProperty(
      '--tms-colors-primary',
      hexToRgb(isDefault ? '#121212' : resultStyle!.primaryColor!)
    )
    document.documentElement.style.setProperty(
      '--tms-colors-primary-dark',
      isDefault ? '#ffffffe9' : resultStyle!.primaryColor!
    )
  }, [resultStyle?.primaryColor])
}

function hexToRgb(hex: string) {
  // Validate hex format
  const validHex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
  if (!validHex.test(hex)) {
    throw new Error('Invalid hex color format')
  }

  // Remove the hash symbol if it exists
  hex = hex.replace(/^#/, '')

  // Parse the hexadecimal values
  let bigint = parseInt(hex, 16)
  let r = (bigint >> 16) & 255
  let g = (bigint >> 8) & 255
  let b = bigint & 255

  // Return the RGB values
  return `${r} ${g} ${b}`
}
