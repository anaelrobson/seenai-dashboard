declare module 'canvas' {
  interface Canvas {
    getContext(contextId: '2d'): CanvasRenderingContext2D;
    toBuffer(type?: 'image/png'): Buffer;
  }
  interface FontOptions {
    family: string;
    weight?: string;
    style?: string;
  }
  function createCanvas(width: number, height: number): Canvas;
  function registerFont(path: string, options: FontOptions): void;
  export { createCanvas, registerFont };
}
