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
  /** 定义一个不可枚举的属性 */

  function def(data, key, value) {
    Object.defineProperty(data, key, {
      enumerable: false,
      configurable: false,
      value: value
    });
  }

  /**
   * array.js文件要重写数组的几个常用方法
   * push shift unshift pop reverse sort splice这些会导致数组本身发生变化的方法要重写
   * 像slice不是改变本身而是产生副本的方法不需要重写
   */

  var oldArrayMethods = Array.prototype;
  /**
   * 给arrayMethods扩展原型，指向oldArrayMethods。其实就是数组原生的prototype
   * arrayMethods -> oldArrayMethods -> Object.prototype -> null
   */

  var arrayMethods = Object.create(oldArrayMethods);
  var methods = ['push', 'shift', 'unshift', 'pop', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      /** 重写的新方法先调用原生的方法，并且把该传入的参数传入
       * 然后this就是指调用数组方法的数组实例
       * 其实这个就是AOP切片编程思想
       */
      oldArrayMethods[method].apply(this, args);
      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        /** splice(0, 1, newValue) */

        case 'splice':
          inserted = args.slice(2);
          break;
      }

      if (inserted) {
        /** 将新增的属性继续去劫持 */
        ob.observeArray(inserted);
      }
    };
  });

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

      // data.__ob__ = this

      /** 在data定一个不可枚举和修改的属性，叫做__ob__ */
      def(data, '__ob__', this);
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
        Object.setPrototypeOf(data, arrayMethods);
        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }
    /**
     * observeArray劫持数组跟walk不同的地方在于，碰到数组本身会直接绕过，即不处理数组的索引
     * 直接处理数组的每一个值，这样子索引就不会被劫持到。而用walk不止会对数组元素劫持，会对数组自身也劫持（即数组的索引）
     */


    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        /** 遍历数组,劫持每一个对象（为啥这么说？是因为observe自带判断，如果非对象类型即object类型直接return了） */
        for (var i = 0; i < data.length; i++) {
          /** 如果是基本属性，就跳过
           * 如果是对象就会劫持对象
           * data: -> [ { age: 1 } ]
           * data[i] -> { age: 1 }
           */
          observe(data[i]);
        }
      }
      /** 遍历对象进行defineReactive */

    }, {
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
