import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification, getDetailedTime, getClientIp } from '@/lib/telegram';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const deployment = await prisma.deployment.findUnique({
      where: { id }
    });

    if (!deployment) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    const vercelToken = process.env.VERCEL_API_TOKEN;
    if (vercelToken) {
      try {
        await fetch(`https://api.vercel.com/v9/projects/${deployment.projectName}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${vercelToken}`
          }
        });
      } catch (vercelErr) {
        console.error('Failed to delete on Vercel:', vercelErr);
      }
    }

    await prisma.deployment.delete({
      where: { id }
    });

    const ip = getClientIp(req);
    const time = getDetailedTime();
    await sendTelegramNotification(`🗑️ <b>Deployment Deleted from History</b>
📝 <b>Project:</b> <b>${deployment.projectName}</b>
🌍 <b>IP Address:</b> <code>${ip}</code>
🕒 <b>Waktu:</b> ${time}`);

    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
