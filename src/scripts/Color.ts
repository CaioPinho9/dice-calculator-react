export default class Color {
  public static green = `rgb(25, 175, 25)`;
  public static blue = `rgb(20, 152, 222)`;
  public static yellow = `rgb(200, 200, 0)`;
  public static red = `rgb(255, 0, 0)`;

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
