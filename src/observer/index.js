import { isObject } from '../utils/index'

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
    this.walk(data)
  }

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
