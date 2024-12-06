import { CloseIcon } from '../icon/min-icon'
import { TomoSocial } from './tomo-social'
import { useAtomValue } from 'jotai'
import {
  ChainType,
  tomoModalAtom,
  WalletState,
  walletStateAtom
} from '../../state'
import { useSetAtom } from 'jotai/index'
import React, { useCallback, useEffect } from 'react'
import { useAtomCallback } from 'jotai/utils'
import { createPortal } from 'react-dom'

export default function TomoModal() {
  const walletState = useAtomValue(walletStateAtom)
  const tomoModal = useAtomValue(tomoModalAtom)
  const tomoModalControl = useTomoModalControl()
  const { connected } = walletState[tomoModal.chainType] || { connected: false }

  useEffect(() => {
    if (connected) {
      tomoModalControl.close({
        walletState
      })
    }
  }, [connected, tomoModal.open])

  if (!tomoModal.open) {
    return null
  }

  return createPortal(
    <div
      className={
        'tomo-social tm-fixed tm-left-0 tm-top-0 tm-z-40 tm-box-border tm-flex tm-h-screen tm-w-screen tm-overflow-auto tm-bg-tc1/30  tm-font-poppins'
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
        {connected ? null : (
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

        <TomoSocial isModal chainType={tomoModal.chainType} />
      </div>
    </div>,
    document.body
  )
}

export type ModalResult = {
  walletState: WalletState
}

export function useTomoModalControl() {
  const setTomoModal = useSetAtom(tomoModalAtom)
  return {
    open: useAtomCallback(
      useCallback((get, set, chainType: ChainType) => {
        const walletState = get(walletStateAtom)
        if (walletState[chainType].connected) {
          return
        }
        return new Promise<ModalResult | undefined>((resolve) => {
          setTomoModal({ open: true, resolve, chainType: chainType })
        })
      }, [])
    ),
    close: useAtomCallback(
      useCallback((get, set, result?: ModalResult | undefined) => {
        const tomoModal = get(tomoModalAtom)
        tomoModal.resolve?.(result)
        setTomoModal((prev) => ({ ...prev, open: false }))
      }, [])
    )
  }
}
