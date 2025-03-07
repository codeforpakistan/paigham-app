# Email Configuration Guide

This document explains how to configure and use the email functionality in Paigham.

## Environment Variables

The following environment variables need to be set for email functionality to work:

- `SENDGRID_API_KEY`: Your SendGrid API key
- `DEFAULT_SENDER_EMAIL`: Default sender email address (optional, defaults to 'noreply@example.com')
- `DEFAULT_SENDER_NAME`: Default sender name (optional, defaults to 'Paigham')

## Testing Email Configuration

You can test your email configuration by:

1. Navigate to the `/setup` page
2. Click on the "Test Email" tab
3. Enter a recipient email, subject, and content
4. Click "Send Test Email"

## Troubleshooting

### Module not found: Can't resolve 'fs'

If you encounter this error, it's because SendGrid's Node.js SDK uses modules that aren't available in certain environments. We've addressed this by:

1. Using a custom email provider that makes direct API calls to SendGrid instead of using their SDK
2. Configuring the API routes to use the Node.js runtime instead of Edge runtime
3. Adding proper webpack configuration to handle Node.js modules

If you're still seeing issues:
1. Make sure you're using the latest version of the application
2. Check that the `next.config.js` file includes the proper webpack configuration
3. Ensure you're using the server-side API routes for sending emails

### SendGrid API Key Not Configured

If you see this error, check that:

1. The `SENDGRID_API_KEY` environment variable is set correctly
2. You're using a valid SendGrid API key
3. The API key has the necessary permissions to send emails

### Email Sending Fails

If emails fail to send:

1. Check the server logs for detailed error messages
2. Verify that your SendGrid account is active and in good standing
3. Make sure the recipient email address is valid
4. Check if your SendGrid account has any sending limits or restrictions

## Architecture

The email functionality is implemented with a server-only approach:

1. Client components use API routes to send emails
2. API routes use a custom server-only email provider that makes direct API calls to SendGrid
3. All email-related code is kept on the server side

This architecture ensures that Node.js-specific dependencies don't cause issues in different runtime environments. 