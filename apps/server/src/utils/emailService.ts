import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const createTransporter = () => {
  const emailService = config.get('server.email_service', 'gmail');
  
  if (emailService === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.get('server.email_user'),
        pass: config.get('server.email_password'),
      },
    });
  }

  return nodemailer.createTransport({
    host: config.get('server.smtp_host', 'smtp.gmail.com'),
    port: parseInt(config.get('server.smtp_port', '587')),
    secure: config.get('server.smtp_secure', 'false') === 'true',
    auth: {
      user: config.get('server.email_user'),
      pass: config.get('server.email_password'),
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    if (!config.get('server.email_user') || !config.get('server.email_password')) {
      console.log('Email not configured. Email would be sent to:', options.to);
      console.log('Subject:', options.subject);
      console.log('HTML:', options.html);
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"${config.get('server.email_from_name', 'TrackIt')}" <${config.get('server.email_user')}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const emailTemplates = {
  teamInvitation: (inviteUrl: string, inviterName: string, role: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Team Invitation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4a154b 0%, #350d36 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">TrackIt</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Project Management Platform</p>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #4a154b; margin-top: 0;">You've been invited to join a team!</h2>
            
            <p style="font-size: 16px; color: #555;">
              <strong>${inviterName}</strong> has invited you to join their team on TrackIt as a <strong>${role.replace('_', ' ')}</strong>.
            </p>
            
            <p style="font-size: 16px; color: #555;">
              TrackIt is a comprehensive project management platform that helps teams collaborate, track progress, and achieve their goals.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${inviteUrl}" style="display: inline-block; background: #4a154b; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Accept Invitation
              </a>
            </div>
            
            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #aaa; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
              ${inviteUrl}
            </p>
            
            <p style="font-size: 14px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
            <p>© ${new Date().getFullYear()} TrackIt. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;
  },

  invitationAccepted: (userName: string, inviterName: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation Accepted</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4a154b 0%, #350d36 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">TrackIt</h1>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #4a154b; margin-top: 0;">Invitation Accepted!</h2>
            
            <p style="font-size: 16px; color: #555;">
              Great news! <strong>${userName}</strong> has accepted your invitation and joined your team on TrackIt.
            </p>
            
            <p style="font-size: 16px; color: #555;">
              You can now collaborate with them on projects, assign tasks, and work together to achieve your goals.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${config.get('server.frontend_url', 'http://localhost:5173')}" style="display: inline-block; background: #4a154b; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Go to Dashboard
              </a>
            </div>
          </div>
        </body>
      </html>
    `;
  },
};

