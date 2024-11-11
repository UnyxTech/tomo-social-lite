import { useAtomValue, useSetAtom } from 'jotai'
import { curPageAtom, pagesAtom, TomoPage } from '../state'
import { createContext, useContext } from 'react'

let pageId = 1

export function usePageService() {
  const setPages = useSetAtom(pagesAtom)
  const pageC = useContext(PageContext)
  return {
    open: (
      jsx: any,
      opt?: { type: TomoPage['type']; showClose?: boolean } & TomoPage['opt']
    ) => {
      const { type = 'page', showClose = true, ...otherOpt } = opt || {}
      const id = pageId++
      const p = new Promise((resolve) => {
        setPages((prev) => {
          return [
            ...prev,
            {
              jsx: jsx,
              resolve: resolve,
              type: type,
              showClose: showClose,
              openPageId:
                type === 'drawer'
                  ? pageC.page.type === 'drawer'
                    ? pageC.page.openPageId
                    : pageC.id
                  : undefined,
              id,
              opt: otherOpt
            }
          ]
        })
      })
      // @ts-ignore
      p._pageId = id
      return p as Promise<any> & { _pageId: number }
    },
    close: (id: number, result?: any) => {
      setPages((prev) => {
        const target = prev.find((item) => item.id === id)
        if (target) {
          target.resolve(result)
        }
        return prev.filter((item) => {
          return item.id !== id
        })
      })
    }
  }
}

export const PageContext = createContext({ id: 0, page: {} as TomoPage })

export function usePageControl() {
  const pageC = useContext(PageContext)
  const curPage = useAtomValue(curPageAtom)
  const pageService = usePageService()
  return {
    close: (result?: any) => {
      pageService.close(pageC.id, result)
    },
    isShow: (curPage?.id || 0) === (pageC?.id || 0),
    page: pageC
  }
}
