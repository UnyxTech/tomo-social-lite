import { CloseIcon } from '../icon/min-icon'
import { TomoSocial } from './tomo-social'
import { useAtomValue } from 'jotai'
import {
  tomoModalAtom,
  TomoModalState,
  WalletState,
  walletStateAtom
} from '../../state'
import { useSetAtom } from 'jotai/index'
import React, { useCallback, useEffect } from 'react'
import { useAtomCallback } from 'jotai/utils'
import { usePageService } from '../../hooks/usePageService'

export default function TomoModal() {
  const walletState = useAtomValue(walletStateAtom)
  const tomoModal = useAtomValue(tomoModalAtom)
  const tomoModalControl = useTomoModalControl()

  useEffect(() => {
    if (tomoModal.type === 'connect' && walletState.isConnected) {
      tomoModalControl.close({
        walletState
      })
    }
  }, [walletState.isConnected, tomoModal.type])
  if (!tomoModal.open) {
    return null
  }
  return (
    <div
      className={
        'tomo-social tm-fixed tm-left-0 tm-top-0 tm-z-40 tm-flex tm-h-screen tm-w-screen tm-bg-tc1/30 tm-font-poppins tm-overflow-auto  tm-box-border'
      }
      onClick={() => {
        tomoModalControl.close(undefined)
      }}
    >
      <div
        // className={'tm-relative tm-m-auto tm-overflow-hidden tm-rounded-3xl'}
        className={
          'tm-absolute sm:tm-relative sm:tm-m-auto sm:tm-w-auto tm-bottom-0 tm-left-0 tm-w-full tm-overflow-hidden tm-rounded-t-3xl sm:tm-rounded-b-3xl animate__animated animate__fadeInUp animate__faster sm:tm-animate-none'
        }
        style={{
          filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.30))',
          animationDuration: '0.3s'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {walletState.isConnected ? null : (
          <div
            className={
              'tm-absolute tm-right-0 tm-top-3 tm-z-10 tm-cursor-pointer tm-p-4 tm-text-tc1 dark:tm-text-tc1-dark hover:tm-text-opacity-70'
            }
            onClick={() => {
              tomoModalControl.close(undefined)
            }}
          >
            <CloseIcon />
          </div>
        )}

        <TomoSocial isModal />
      </div>
    </div>
  )
}

export type ModalResult = {
  walletState: WalletState
}

export function useTomoModalControl() {
  const pageService = usePageService()
  const setTomoModal = useSetAtom(tomoModalAtom)
  return {
    open: (type?: TomoModalState['type']) => {
      return new Promise<ModalResult | undefined>((resolve) => {
        setTomoModal({ open: true, type: type || 'default', resolve })
      })
    },
    close: useAtomCallback(
      useCallback((get, set, result?: ModalResult | undefined) => {
        const tomoModal = get(tomoModalAtom)
        tomoModal.resolve?.(result)
        setTomoModal({ open: false })
      }, [])
    )
  }
}
