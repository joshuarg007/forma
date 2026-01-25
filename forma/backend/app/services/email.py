"""Email Service using SendGrid"""
from typing import Optional, List
import logging

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, Attachment, FileContent, FileName, FileType

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Send transactional emails via SendGrid."""

    def __init__(self):
        self.api_key = settings.sendgrid_api_key
        self.from_email = settings.from_email
        self.client = SendGridAPIClient(self.api_key) if self.api_key else None

    def _is_configured(self) -> bool:
        """Check if email service is configured."""
        return bool(self.api_key)

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        from_name: str = "Forma"
    ) -> bool:
        """Send a single email."""
        if not self._is_configured():
            logger.warning(f"Email not configured. Would send to {to_email}: {subject}")
            return False

        try:
            message = Mail(
                from_email=Email(self.from_email, from_name),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )

            if text_content:
                message.add_content(Content("text/plain", text_content))

            response = self.client.send(message)
            logger.info(f"Email sent to {to_email}, status: {response.status_code}")
            return response.status_code in (200, 201, 202)
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    async def send_invite_email(
        self,
        to_email: str,
        inviter_name: str,
        project_name: str,
        invite_token: str,
        role: str,
        message: Optional[str] = None
    ) -> bool:
        """Send project invitation email."""
        invite_url = f"https://forma.app/invites/accept/{invite_token}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .button:hover {{ background: #4f46e5; }}
                .message-box {{ background: #e0e7ff; padding: 15px; border-radius: 6px; margin: 15px 0; }}
                .footer {{ text-align: center; color: #64748b; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>You're Invited!</h1>
                </div>
                <div class="content">
                    <p>Hi there,</p>
                    <p><strong>{inviter_name}</strong> has invited you to collaborate on <strong>{project_name}</strong> as a <strong>{role}</strong>.</p>
                    {f'<div class="message-box"><p><em>"{message}"</em></p></div>' if message else ''}
                    <p>Click the button below to accept the invitation:</p>
                    <p style="text-align: center;">
                        <a href="{invite_url}" class="button">Accept Invitation</a>
                    </p>
                    <p style="font-size: 12px; color: #64748b;">
                        Or copy this link: {invite_url}
                    </p>
                    <p style="font-size: 12px; color: #64748b;">
                        This invitation expires in 7 days.
                    </p>
                </div>
                <div class="footer">
                    <p>Forma - Visual Page Builder</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
You're Invited to {project_name}!

{inviter_name} has invited you to collaborate on {project_name} as a {role}.

{f'Message: "{message}"' if message else ''}

Accept the invitation: {invite_url}

This invitation expires in 7 days.

- Forma Team
        """

        return await self.send_email(
            to_email=to_email,
            subject=f"You're invited to {project_name} on Forma",
            html_content=html_content,
            text_content=text_content
        )

    async def send_welcome_email(self, to_email: str, name: Optional[str] = None) -> bool:
        """Send welcome email to new users."""
        display_name = name or "there"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .feature {{ background: white; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #6366f1; }}
                .footer {{ text-align: center; color: #64748b; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Forma! 🎉</h1>
                </div>
                <div class="content">
                    <p>Hi {display_name},</p>
                    <p>Thanks for joining Forma! We're excited to help you build beautiful web pages with AI.</p>

                    <h3>Here's what you can do:</h3>
                    <div class="feature">
                        <strong>🎨 Visual Builder</strong>
                        <p>Drag and drop 100+ pre-built components to build pages visually.</p>
                    </div>
                    <div class="feature">
                        <strong>🤖 AI Generation</strong>
                        <p>Describe what you want and let AI generate custom React components.</p>
                    </div>
                    <div class="feature">
                        <strong>📤 Export</strong>
                        <p>Export your pages as Next.js or Vite projects.</p>
                    </div>

                    <p style="text-align: center;">
                        <a href="https://forma.app/dashboard" class="button">Get Started</a>
                    </p>
                </div>
                <div class="footer">
                    <p>Forma - Visual Page Builder</p>
                </div>
            </div>
        </body>
        </html>
        """

        return await self.send_email(
            to_email=to_email,
            subject="Welcome to Forma! 🎉",
            html_content=html_content
        )

    async def send_password_reset_email(
        self,
        to_email: str,
        reset_token: str,
        name: Optional[str] = None
    ) -> bool:
        """Send password reset email."""
        reset_url = f"https://forma.app/auth/reset-password?token={reset_token}"
        display_name = name or "there"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #fef2f2; color: #991b1b; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; color: #64748b; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hi {display_name},</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <p style="text-align: center;">
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </p>
                    <p style="font-size: 12px; color: #64748b;">
                        Or copy this link: {reset_url}
                    </p>
                    <p style="font-size: 12px; color: #64748b;">
                        This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
                    </p>
                </div>
                <div class="footer">
                    <p>Forma - Visual Page Builder</p>
                </div>
            </div>
        </body>
        </html>
        """

        return await self.send_email(
            to_email=to_email,
            subject="Reset your Forma password",
            html_content=html_content
        )

    async def send_subscription_confirmation(
        self,
        to_email: str,
        plan: str,
        name: Optional[str] = None
    ) -> bool:
        """Send subscription confirmation email."""
        display_name = name or "there"
        plan_display = plan.capitalize()

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }}
                .plan-box {{ background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #10b981; }}
                .footer {{ text-align: center; color: #64748b; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Subscription Confirmed! ✅</h1>
                </div>
                <div class="content">
                    <p>Hi {display_name},</p>
                    <p>Thank you for subscribing to Forma!</p>
                    <div class="plan-box">
                        <h2>{plan_display} Plan</h2>
                        <p>Your subscription is now active.</p>
                    </div>
                    <p>You now have access to all {plan_display} features. If you have any questions, just reply to this email.</p>
                </div>
                <div class="footer">
                    <p>Forma - Visual Page Builder</p>
                </div>
            </div>
        </body>
        </html>
        """

        return await self.send_email(
            to_email=to_email,
            subject=f"Welcome to Forma {plan_display}!",
            html_content=html_content
        )


# Singleton instance
email_service = EmailService()
