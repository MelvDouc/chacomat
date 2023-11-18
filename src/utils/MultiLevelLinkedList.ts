export default class MultiLevelLinkedList {
  protected _prev: this | null = null;
  protected readonly _next: this[] = [];

  get head(): this {
    return this._prev?.head ?? this;
  }

  get tail(): this {
    return this.getNext(0)?.tail ?? this;
  }

  get nextCount() {
    return this._next.length;
  }

  get index() {
    if (!this._prev)
      return 0;
    return this._prev._next.indexOf(this);
  }

  getPrev() {
    return this._prev;
  }

  setPrev(value: this) {
    this._prev = value;
    return this;
  }

  removePrev() {
    this._prev = null;
    return this;
  }

  next() {
    return this._next.values();
  }

  hasNext(index: number) {
    return index < this._next.length;
  }

  getNext(index: number) {
    return this._next.at(index);
  }

  addNext(value: this) {
    this._next.push(value);
  }

  replaceNext(index: number, value: this) {
    this._next[index] = value;
  }

  removeNext(index: number) {
    this._next.splice(index, 1);
  }

  popNext() {
    this._next.pop();
  }

  clearNext() {
    this._next.length = 0;
  }
}