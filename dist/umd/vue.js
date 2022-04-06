var Vue = (function () {
  'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  /** 判断当前data是不是对象类型 */
  function isObject(data) {
    return data !== null && _typeof(data) === 'object';
  }

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
    observe(value);
    Object.defineProperty(data, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        /** 这个判断要加上，要不然可能死循环
         * 原因：在set函数里头进行value = newValue，那么就是给value赋值，一给value赋值就会触发set函数
         * 于是又进入set函数了，此时能够通过是因为这句判断newValue等于value了，所以return了
         * 要不然就会无限执行value = newValue
         */
        if (newValue === value) return;
        /**
         * 由于用户使用上还可能直接vm._data.b = { name:'jaylen'}直接赋值一个新对象，覆盖了原来劫持的对象了
         * 所以set方法也是需要劫持的
         */

        observe(newValue);
        value = newValue;
      }
    });
  }
  /** Observer用于观测数据 */


  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      this.walk(data);
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
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
        var keys = Object.keys(data);
        /** 遍历keys [a,b] */

        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          /** a */

          var value = data[key];
          /** 1 */

          /**
           * data = {
           *   a: 1,
           *   b: 2
           * }
           * key = a
           * value = 1
           */

          defineReactive(data, key, value);
        }
      }
    }]);

    return Observer;
  }();
  /** 负责data的观测：数据劫持
   * 把data里头的数据，都是用Object.defineProperty去重新定义成get，set的方式
   * 只有对象才会被劫持即，isObject(data) === true
   */


  function observe(data) {
    /** null和非对象直接返回 */
    if (!isObject(data)) return;
    /** Observer用于观测数据 */

    return new Observer(data);
  }

  function initData(vm) {
    var data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data;
    vm._data = data;
    /** 对象劫持：为了用户改变数据的时候，我们能够得到通知（其实就是刷新页面） */

    /** MVVM模式：数据变化可以驱动视图变化 */

    /**
     * observe: 核心功能，给属性增加get和set方法
     * 这个就是vue的响应式原理
     */

    observe(data);
  }

  function initState(vm) {
    /** Vue的数据来源很多：属性，方法，数据，计算属性，watch */
    var options = vm.$options;
    /** 属性初始化 */

    if (options.props) ;
    /** 方法初始化 */


    if (options.methods) ;
    /** 数据初始化 */


    if (options.data) {
      initData(vm);
    }
    /** 计算属性初始化 */


    if (options.computed) ;
    /** watch初始化*/


    if (options.watch) ;
  }

  function _init(options) {
    var vm = this;
    vm.$options = options;
    /** 初始化状态 */

    initState(vm);
  }

  var Vue = /*#__PURE__*/_createClass(function Vue(options) {
    _classCallCheck(this, Vue);

    this._init(options);
  });
  Vue.prototype._init = _init;

  return Vue;

})();
//# sourceMappingURL=vue.js.map
