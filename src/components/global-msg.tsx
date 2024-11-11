import { useAtomValue } from 'jotai'
import { globalMsgListAtom, Msg, MsgState } from '../state'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSetAtom } from 'jotai/index'
import { ErrorIcon, SuccessIcon, WaringIcon } from './icon/min-icon'

export function GlobalMsg() {
  const msgList = useAtomValue(globalMsgListAtom)
  return (
    <div
      className={
        'tm-pointer-events-none tm-absolute tm-bottom-20 tm-flex tm-w-full tm-flex-col tm-items-center tm-gap-4'
      }
    >
      {[...msgList].reverse().map((msg) => {
        return <MsgItem msg={msg} key={msg.id} />
      })}
    </div>
  )
}

const iconMap = {
  success: <SuccessIcon className={'tm-size-4 tm-text-success'} />,
  error: <ErrorIcon className={'tm-size-4 tm-text-danger'} />,
  warning: <WaringIcon className={'tm-size-4 tm-text-warning'} />
} as Record<Msg['type'], any>

function MsgItem({ msg }: { msg: MsgState }) {
  const [startTiming, setStartTiming] = useState(true)
  const msgService = useMsgService()
  useEffect(() => {
    if (startTiming) {
      const timer = setTimeout(() => {
        msgService.remove(msg.id)
      }, msg.duration)
      return () => clearTimeout(timer)
    }
  }, [startTiming])
  return (
    <div
      key={msg.id}
      className={
        'tm-pointer-events-auto tm-flex tm-max-w-[80%] tm-items-center tm-gap-2 tm-overflow-hidden tm-rounded-lg tm-bg-white tm-px-4 tm-py-2 tm-text-sm dark:tm-bg-white-dark animate__animated animate__fadeInUp animate__faster'
      }
      onMouseOver={() => {
        setStartTiming(false)
      }}
      onMouseLeave={() => {
        setStartTiming(true)
      }}
      style={{
        // boxShadow: '0px 0px 4px 0px rgba(213, 213, 213, 0.25)',
        boxShadow:
          '0 6px 16px 0 rgba(0, 0, 0, 0.08),0 3px 6px -4px rgba(0, 0, 0, 0.12),0 9px 28px 8px rgba(0, 0, 0, 0.05)'
      }}
    >
      {iconMap[msg.type]}
      <div className={'tm-flex-1 tm-overflow-hidden'}>{msg.title}</div>
    </div>
  )
}

let msgIdIndex = 1

export function useMsgService() {
  const setMsgList = useSetAtom(globalMsgListAtom)
  return useMemo(() => {
    return {
      remove: (id: number) => {
        setMsgList((prev) => {
          return prev.filter((msg) => {
            return msg.id !== id
          })
        })
      },
      removeSameMsg: (title: string) => {
        setMsgList((prev) => {
          return prev.filter((msg) => {
            return msg.title !== title
          })
        })
      },
      show: (msg: Msg) => {
        setMsgList((prev) => {
          return [...prev, { type: 'success', ...msg, id: msgIdIndex++ }]
        })
      }
    }
  }, [])
}
