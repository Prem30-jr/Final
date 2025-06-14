import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'epremkumar24@gmail.com',
    pass: process.env.EMAIL_PASS || 'nnzqtcbskpbptkwm' // Your Gmail app password
  }
});

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  const { from, to, cc, bcc, subject, content } = req.body;

  try {
    const mailOptions = {
      from,
      to,
      cc,
      bcc,
      subject,
      text: content
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 