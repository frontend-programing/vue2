import { observe } from './observer/index'

function initProps(vm) {}
function initMethods(vm) {}
function initData(vm) {
  let data = vm.$options.data
  data = typeof data === 'function' ? data.call(vm) : data
  vm._data = data
  /** 对象劫持：为了用户改变数据的时候，我们能够得到通知（其实就是刷新页面） */
  /** MVVM模式：数据变化可以驱动视图变化 */
  /**
   * observe: 核心功能，给属性增加get和set方法
   * 这个就是vue的响应式原理
   */
  observe(data)
}
function initComputed(vm) {}
function initWatch(vm) {}

export function initState(vm) {
  /** Vue的数据来源很多：属性，方法，数据，计算属性，watch */
  const options = vm.$options

  /** 属性初始化 */
  if (options.props) {
    initProps(vm)
  }

  /** 方法初始化 */
  if (options.methods) {
    initMethods(vm)
  }

  /** 数据初始化 */
  if (options.data) {
    initData(vm)
  }

  /** 计算属性初始化 */
  if (options.computed) {
    initComputed(vm)
  }

  /** watch初始化*/
  if (options.watch) {
    initWatch(vm)
  }
}
