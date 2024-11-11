import { useEffect, useState } from 'react'
import { usePageService } from './usePageService'
import { ReloadIcon } from '../components/icon/min-icon'

const loadState = {
  getNextState(cur: boolean | number, change: number) {
    if (!cur || typeof cur === 'boolean') {
      cur = 0
    }
    return cur + change
  },
  createFn(changeLoadFn: Function) {
    return async function <T>(
      promise: Promise<T> | Function | Boolean
    ): Promise<T> {
      if (typeof promise === 'boolean') {
        changeLoadFn(promise ? 1 : -1)
        // @ts-ignore
        return
      }
      changeLoadFn(1)
      let result
      try {
        if (typeof promise === 'function') {
          result = await promise()
        } else {
          result = await promise
        }
      } catch (e) {
        changeLoadFn(-1)
        throw e
      }
      changeLoadFn(-1)
      return result
    }
  }
}

export function useLoading(
  initValue: boolean | number = false
): [boolean, <T>(promise: Promise<T> | Function | Boolean) => Promise<T>] {
  const [loading, setLoading] = useState<boolean | number>(initValue)
  return [
    !!loading,
    loadState.createFn((change: number) => {
      setLoading((prev: boolean | number) =>
        loadState.getNextState(prev, change)
      )
    })
  ]
}

export function useLoadingPage(loading: boolean) {
  const pageService = usePageService()
  useEffect(() => {
    if (loading) {
      const promise = pageService.open(<LoadingSpin />, {
        type: 'drawer',
        noBg: true,
        full: true,
        animate: false
      })
      return () => {
        pageService.close(promise._pageId)
      }
    }
  }, [loading])
}

export function LoadingSpin() {
  return (
    <div
      className={
        'tm-flex tm-h-full tm-w-full tm-items-center tm-justify-center'
      }
    >
      <div
        className={
          'tm-flex tm-size-16 tm-items-center tm-justify-center tm-rounded-lg tm-bg-white dark:tm-bg-white-dark'
        }
      >
        <ReloadIcon
          className={
            'tm-size-7 tm-animate-spin tm-text-tc1 dark:tm-text-tc1-dark'
          }
        />
      </div>
    </div>
  )
}
