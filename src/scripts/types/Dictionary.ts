export interface IKeyCollection {
  add(key: number, value: number);
  set(key: number, value: number);
  containsKey(key: number): boolean;
  size(): number;
  get(key: number): number;
  removeItem(key: number): number;
  getKeys(): number[];
  values(): number[];
}

export default class Dictionary implements IKeyCollection {
  private items: { [index: number]: number } = {};
  private count: number = 0;

  add(key: number, value: number) {
    if (this.items[key] != null) {
      this.items[key] += value;
    } else {
      this.count++;
      this.items[key] = value;
    }
  }

  set(key: number, value: number) {
    if (this.items[key] == null) {
      this.count++;
    }

    this.items[key] = value;
  }

  containsKey(key: number): boolean {
    return this.items.hasOwnProperty(key);
  }

  size(): number {
    return this.count;
  }

  get(key: number): number {
    return this.items[key];
  }

  removeItem(key: number): number {
    let value = this.items[key];

    delete this.items[key];
    this.count--;

    return value;
  }

  //Not ordered
  getKeys(): number[] {
    let keySet: number[] = [];

    for (let property in this.items) {
      if (!isNaN(Number(property))) {
        keySet.push(Number(property));
      }
    }

    return keySet;
  }

  values(): number[] {
    let values: number[] = [];

    for (let property in this.items) {
      if (!isNaN(Number(property))) {
        values.push(this.items[Number(property)]);
      }
    }

    return values;
  }

  sum(): number {
    let sum: number = 0;

    this.values().forEach((value) => (sum += value));
    return sum;
  }

  min(): number {
    return Math.min(...this.getKeys());
  }

  max(): number {
    return Math.max(...this.getKeys());
  }

  toArray(): number[] {
    let array: any[] = [];
    const min: number = this.min();
    for (let key = 0; key <= this.max() - min; key++) {
      array[key] = this.get(key + min);
    }
    return array;
  }
}
