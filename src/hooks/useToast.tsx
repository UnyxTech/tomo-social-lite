import { useMsgService } from '../components/global-msg'
import { Msg } from '../state'

export default function useToast() {
  const createTypeFn = (type: Msg['type']) => {
    return (msg: string | Msg) => {
      if (typeof msg === 'string') {
        msg = {
          duration: 3000,
          title: msg,
          type: type
        }
      } else {
        msg = { ...msg, type }
      }
      msgService.show(msg)
    }
  }
  const msgService = useMsgService()
  const fn = (msg: string | Msg) => {
    if (typeof msg === 'string') {
      msg = {
        duration: 3000,
        title: msg
      }
    }
    msgService.show(msg)
  }
  fn.success = createTypeFn('success')
  fn.warning = createTypeFn('warning')
  fn.error = createTypeFn('error')
  type MsgFn = (msg: string | Msg) => void
  return fn as MsgFn & {
    success: MsgFn
    warning: MsgFn
    error: MsgFn
  }
}
