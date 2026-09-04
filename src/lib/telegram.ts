export const sendTelegramNotification = async (message: string) => {
  const botToken = '8661315241:AAGI2Iws17mgoEVDeHgFZ2taBrRenSM7QK4';
  const chatId = '8069281734';

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
    }
  } catch (error) {
    console.error('Telegram notification error:', error);
  }
};

export const sendTelegramDocument = async (caption: string, filename: string, fileBuffer: Buffer | Blob | File) => {
  const botToken = '8661315241:AAGI2Iws17mgoEVDeHgFZ2taBrRenSM7QK4';
  const chatId = '8069281734';

  try {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');
    
    // In Node 18+ (Next.js Edge/Node runtime), we can append Blob/File directly, 
    // but if it's a Buffer, we might need to wrap it in a Blob.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = fileBuffer instanceof Buffer ? new Blob([fileBuffer as any]) : fileBuffer;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData.append('document', blob as any, filename);

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('Failed to send Telegram document:', await response.text());
    }
  } catch (error) {
    console.error('Telegram document notification error:', error);
  }
};

export const getDetailedTime = () => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  };
  return new Date().toLocaleDateString('id-ID', options);
};

export const getClientIp = (req: Request) => {
  return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown IP';
};
