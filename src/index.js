import { _init } from './init'

export default class Vue {
  constructor(options) {
    this._init(options)
  }
}

Vue.prototype._init = _init
