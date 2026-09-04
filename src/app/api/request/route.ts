import { NextResponse } from 'next/server';
import { sendTelegramNotification, getClientIp } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const { requestText, senderName } = await req.json();

    if (!requestText) {
      return NextResponse.json({ message: 'Missing request text' }, { status: 400 });
    }

    const ip = getClientIp(req);

    const message = `💡 <b>NEW FEATURE REQUEST!</b>
    
👤 <b>From:</b> ${senderName || 'Anonymous'}
🌍 <b>IP:</b> <code>${ip}</code>

💬 <b>Message:</b>
${requestText}`;

    await sendTelegramNotification(message);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('POST Request Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
