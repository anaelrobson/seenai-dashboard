import { NextResponse } from 'next/server';
import { renderTextImage } from '../../utils/canvasText';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || 'Hello World';
  const buffer = renderTextImage(text, { width: 800, height: 200, fontSize: 64 });
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': buffer.length.toString(),
    },
  });
}
