import { createCanvas, registerFont } from 'canvas';

// Register Inter font from @fontsource
const interPath = require.resolve(
  '@fontsource/inter/files/inter-latin-400-normal.ttf'
);
registerFont(interPath, { family: 'Inter', weight: 'normal', style: 'normal' });

export interface TextOptions {
  width?: number;
  height?: number;
  fontSize?: number;
  color?: string;
}

export function renderTextImage(text: string, opts: TextOptions = {}): Buffer {
  const width = opts.width ?? 1280;
  const height = opts.height ?? 720;
  const fontSize = opts.fontSize ?? 48;
  const color = opts.color ?? '#ffffff';

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Ensure anti-aliased text
  ctx.antialias = 'subpixel';

  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = color;
  ctx.font = `${fontSize}px "Inter"`;
  ctx.textBaseline = 'top';
  ctx.fillText(text, 0, 0);

  return canvas.toBuffer('image/png');
}
