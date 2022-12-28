export default class Color {
  public static green = [`rgb(81, 158, 60)`, `#189E00`, `#009E6D`];
  public static blue = [`rgb(76, 144, 173)`, `#0072AD`, `#4518AD`];
  public static yellow = [`rgb(179, 159, 71)`, `#B3AB01`, `#B36300`];
  public static red = [`rgb(189, 97, 74)`, `#BD2200`, `#BD11B6`];

  //Create a random rgb color
  public static randomColor(): string {
    const r = Math.random() * 255;
    const g = Math.random() * 255;
    const b = Math.random() * 255;
    return `rgb(${r},${g},${b})`;
  }

  //Create a random red color
  public static randomRed(): string {
    const r = 255;
    const g = Math.random() * 255;
    const b = Math.random() * 255;
    return `rgb(${r},${g},${b})`;
  }

  //Create a random green color
  public static randomGreen(): string {
    const r = Math.random() * 255;
    const g = 255;
    const b = Math.random() * 255;
    return `rgb(${r},${g},${b})`;
  }

  //Create a random blue color
  public static randomBlue(): string {
    const r = Math.random() * 255;
    const g = Math.random() * 255;
    const b = 255;
    return `rgb(${r},${g},${b})`;
  }

  //Create a random yellow color
  public static randomYellow(): string {
    const r = 255;
    const g = 255;
    const b = Math.random() * 255;
    return `rgb(${r},${g},${b})`;
  }
}
