import { observe } from './index'
/**
 * array.js文件要重写数组的几个常用方法
 * push shift unshift pop reverse sort splice这些会导致数组本身发生变化的方法要重写
 * 像slice不是改变本身而是产生副本的方法不需要重写
 */

const oldArrayMethods = Array.prototype

/**
 * 给arrayMethods扩展原型，指向oldArrayMethods。其实就是数组原生的prototype
 * arrayMethods -> oldArrayMethods -> Object.prototype -> null
 */
export const arrayMethods = Object.create(oldArrayMethods)

const methods = ['push', 'shift', 'unshift', 'pop', 'reverse', 'sort', 'splice']

methods.forEach((method) => {
  arrayMethods[method] = function (...args) {
    /** 重写的新方法先调用原生的方法，并且把该传入的参数传入
     * 然后this就是指调用数组方法的数组实例
     * 其实这个就是AOP切片编程思想
     */
    oldArrayMethods[method].apply(this, args)
    let inserted
    const ob = this.__ob__
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      /** splice(0, 1, newValue) */
      case 'splice':
        inserted = args.slice(2)
        break
    }

    if (inserted) {
      /** 将新增的属性继续去劫持 */
      ob.observeArray(inserted)
    }
  }
})
