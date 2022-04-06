import { def, isObject } from '../utils/index'
import { arrayMethods } from './array'

/** defineReactive利用Object.defineProperty重新定义data中的属性
 * Object.defineProperty(data, 'a', {
 *   get() {
 *     return 1
 *   }
 * })
 */
function defineReactive(data, key, value) {
  /**
   * 直接传value，因为很可能嵌套对象也需要劫持
   * 递归劫持
   *  其实这里头也隐藏了判断逻辑，即只劫持对象，如果是普通属性直接就拒绝掉不执行函数了
   */
  observe(value)
  Object.defineProperty(data, key, {
    get() {
      return value
    },
    set(newValue) {
      /** 这个判断要加上，要不然可能死循环
       * 原因：在set函数里头进行value = newValue，那么就是给value赋值，一给value赋值就会触发set函数
       * 于是又进入set函数了，此时能够通过是因为这句判断newValue等于value了，所以return了
       * 要不然就会无限执行value = newValue
       */
      if (newValue === value) return
      /**
       * 由于用户使用上还可能直接vm._data.b = { name:'jaylen'}直接赋值一个新对象，覆盖了原来劫持的对象了
       * 所以set方法也是需要劫持的
       */
      observe(newValue)
      value = newValue
    }
  })
}

/** Observer用于观测数据 */
class Observer {
  constructor(data) {
    // data.__ob__ = this
    /** 在data定一个不可枚举和修改的属性，叫做__ob__ */
    def(data, '__ob__', this)
    /**
     * 能执行到这一步，只有引用类型才能做到
     * 目前只考虑数组和对象两种情况
     * 假如，我们要劫持的是数组的话，按目前的情况，我们会把数组的每一个key，也就是下标索引劫持了
     * 但是vue内部不是这样做的，因为劫持数组的下标很耗费性能
     * 前端开发中，很少直接操作数组，都是操作arr.push,arr.shift这一类间接操作索引的方法
     */
    if (Array.isArray(data)) {
      /**
       * Object.setPrototypeOf(data, arrayMethods)
       * Array实例 -> arrayMethods -> oldArrayMethods -> Object.prototype -> null
       */
      Object.setPrototypeOf(data, arrayMethods)
      this.observeArray(data)
    } else {
      this.walk(data)
    }
  }

  /**
   * observeArray劫持数组跟walk不同的地方在于，碰到数组本身会直接绕过，即不处理数组的索引
   * 直接处理数组的每一个值，这样子索引就不会被劫持到。而用walk不止会对数组元素劫持，会对数组自身也劫持（即数组的索引）
   */
  observeArray(data) {
    /** 遍历数组,劫持每一个对象（为啥这么说？是因为observe自带判断，如果非对象类型即object类型直接return了） */
    for (let i = 0; i < data.length; i++) {
      /** 如果是基本属性，就跳过
       * 如果是对象就会劫持对象
       * data: -> [ { age: 1 } ]
       * data[i] -> { age: 1 }
       */
      observe(data[i])
    }
  }
  /** 遍历对象进行defineReactive */
  walk(data) {
    /** 获取data所有key
     *  new Vue({
     *   data() {
     *     return {
     *       a: 1,
     *       b: 2
     *     }
     *   }
     * })
     * 获取到 [a,b]
     *
     */
    const keys = Object.keys(data)
    /** 遍历keys [a,b] */
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] /** a */
      const value = data[key] /** 1 */
      /**
       * data = {
       *   a: 1,
       *   b: 2
       * }
       * key = a
       * value = 1
       */
      defineReactive(data, key, value)
    }
  }
}

/** 负责data的观测：数据劫持
 * 把data里头的数据，都是用Object.defineProperty去重新定义成get，set的方式
 * 只有对象才会被劫持即，isObject(data) === true
 */
export function observe(data) {
  /** null和非对象直接返回 */
  if (!isObject(data)) return

  /** Observer用于观测数据 */
  return new Observer(data)
}
