import { OAuth2Client } from 'google-auth-library';

const clientId = process.env.GOOGLE_CLIENT_ID || '102552181823-b2sm2hnide622rig9lscr3rceci1i6ac.apps.googleusercontent.com';
const client = new OAuth2Client(clientId);

export interface GooglePayload {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

export async function verifyGoogleToken(idToken: string): Promise<GooglePayload> {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new Error('Google Token không hợp lệ hoặc thiếu thông tin Email');
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture,
    };
  } catch (error: any) {
    console.error('Lỗi xác thực Google Token:', error.message);
    throw new Error('Xác thực Google Token thất bại: ' + error.message);
  }
}
