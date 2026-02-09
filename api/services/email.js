import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize SES client (always use us-east-1 for SES)
const sesClient = new SESClient({ region: 'us-east-1' });

const APP_NAME = 'Simple A/B Testing';

/**
 * Send magic link email via AWS SES
 */
export async function sendMagicLinkEmail(toEmail, magicLink) {
  const fromEmail = process.env.FROM_EMAIL;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';

  if (!fromEmail) {
    throw new Error('FROM_EMAIL environment variable is not set');
  }

  const params = {
    Source: fromEmail,
    Destination: {
      ToAddresses: [toEmail]
    },
    Message: {
      Subject: {
        Data: `Sign in to ${APP_NAME}`,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: createEmailTemplate(magicLink, frontendUrl),
          Charset: 'UTF-8'
        },
        Text: {
          Data: createTextEmail(magicLink),
          Charset: 'UTF-8'
        }
      }
    }
  };

  try {
    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    console.log(`Email sent to ${toEmail}, MessageId: ${result.MessageId}`);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

/**
 * HTML email template
 */
function createEmailTemplate(magicLink, frontendUrl) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; color: #1e293b; font-weight: 700;">${APP_NAME}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #1e293b; font-weight: 600;">Sign in to your account</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; line-height: 1.6;">
                Click the button below to securely sign in to your ${APP_NAME} account. This link will expire in 15 minutes.
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${magicLink}" style="display: inline-block; padding: 14px 32px; background-color: #3ecf8e; color: #1e293b; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(62, 207, 142, 0.3);">
                      Sign In
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #3ecf8e; word-break: break-all; font-family: 'Monaco', 'Courier New', monospace;">
                ${magicLink}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                If you didn't request this email, you can safely ignore it.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #94a3b8;">
                <a href="${frontendUrl}" style="color: #3ecf8e; text-decoration: none;">${APP_NAME}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Plain text email (fallback)
 */
function createTextEmail(magicLink) {
  return `
Sign in to ${APP_NAME}

Click the link below to securely sign in to your account:

${magicLink}

This link will expire in 15 minutes.

If you didn't request this email, you can safely ignore it.

${APP_NAME}
  `.trim();
}
