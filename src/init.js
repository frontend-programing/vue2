import { initState } from './state'

export function _init(options) {
  const vm = this
  vm.$options = options
  /** 初始化状态 */
  initState(vm)
}
