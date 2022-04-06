/** 判断当前data是不是对象类型 */
export function isObject(data) {
  return data !== null && typeof data === 'object'
}

/** 定义一个不可枚举的属性 */
export function def(data, key, value) {
  Object.defineProperty(data, key, {
    enumerable: false,
    configurable: false,
    value
  })
}
