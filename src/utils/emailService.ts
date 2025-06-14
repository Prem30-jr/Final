import { Transaction } from '../types';

// Email service configuration
const EMAIL_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID', // e.g., 'service_gmail'
  templateId: 'YOUR_TEMPLATE_ID', // Email template ID
  userId: 'YOUR_USER_ID', // Email service user ID
};

interface EmailData {
  to: string;
  subject: string;
  templateData: {
    transactionId: string;
    amount: number;
    recipient: string;
    sender: string;
    timestamp: string;
    description: string;
    status: string;
    balance: number;
  };
}

export const sendTransactionEmail = async (transaction: Transaction, userEmail: string, balance: number): Promise<boolean> => {
  try {
    // Format the transaction data for the email
    const emailData: EmailData = {
      to: userEmail,
      subject: `Transaction Notification - ${transaction.amount > 0 ? 'Credit' : 'Debit'} of ${Math.abs(transaction.amount)}`,
      templateData: {
        transactionId: transaction.id,
        amount: transaction.amount,
        recipient: transaction.recipient,
        sender: transaction.sender,
        timestamp: new Date(transaction.timestamp).toLocaleString(),
        description: transaction.description,
        status: transaction.status,
        balance: balance,
      },
    };

    // Here you would integrate with your email service provider
    // For example, using EmailJS, SendGrid, or any other email service
    // This is a placeholder for the actual email sending implementation
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error('Failed to send email notification');
    }

    console.log('Transaction email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending transaction email:', error);
    return false;
  }
};

// Email template HTML (you can customize this based on your needs)
export const getEmailTemplate = (data: EmailData['templateData']): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 5px; }
          .transaction-details { margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: ${data.amount > 0 ? '#28a745' : '#dc3545'}; }
          .footer { margin-top: 20px; font-size: 12px; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Transaction Notification</h2>
          </div>
          <div class="transaction-details">
            <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
            <p><strong>Amount:</strong> <span class="amount">${data.amount > 0 ? '+' : ''}${data.amount}</span></p>
            <p><strong>From:</strong> ${data.sender}</p>
            <p><strong>To:</strong> ${data.recipient}</p>
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Time:</strong> ${data.timestamp}</p>
            <p><strong>Status:</strong> ${data.status}</p>
            <p><strong>Current Balance:</strong> ${data.balance}</p>
          </div>
          <div class="footer">
            <p>This is an automated message from O'Link. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}; 