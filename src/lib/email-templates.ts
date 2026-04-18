export function buildAdminOtpEmailTemplate(otpCode: string) {
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Couplesna Admin OTP</title>
    </head>
    <body style="margin:0;padding:0;background:#0b0b0f;font-family:Arial,sans-serif;color:#f8f8ff;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#12121a;border:1px solid rgba(255,255,255,0.12);border-radius:20px;overflow:hidden;">
              <tr>
                <td style="padding:28px 28px 12px 28px;">
                  <p style="margin:0 0 10px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b8a9d9;">Couplesna Admin Access</p>
                  <h1 style="margin:0;font-size:28px;line-height:1.2;color:#ffffff;">Your one-time verification code</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 28px;">
                  <p style="margin:0 0 18px 0;font-size:15px;line-height:1.6;color:#d7d4e4;">
                    Use this OTP to continue your admin login. The code expires in <strong>10 minutes</strong>.
                  </p>
                  <div style="background:#0d0d14;border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:18px 16px;text-align:center;">
                    <span style="font-size:34px;line-height:1;letter-spacing:0.35em;font-weight:700;color:#c98cff;">${otpCode}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px 28px 28px;">
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#9892a9;">
                    If you did not request this code, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}
