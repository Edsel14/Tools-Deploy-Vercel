import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('GET Messages Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { sender, content } = await req.json();

    if (!sender || !content) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: { sender, content }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('POST Message Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
