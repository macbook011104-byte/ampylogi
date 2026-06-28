const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const QUERIES_FILE = path.join(__dirname, 'queries.json');

// Middlewares
app.use(cors());
app.use(express.json());
// Serve static frontend files directly from the current directory
app.use(express.static(__dirname));

// Email Transporter Config (Reads from environment variables)
// Set these in production: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, RECEIVER_EMAIL
const mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email', // Fallback to Ethereal Mail test service
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || null, // Fill in your SMTP email
        pass: process.env.SMTP_PASS || null  // Fill in your SMTP password
    }
});

// Endpoint to handle Query Form Submissions
app.post('/api/query', async (req, res) => {
    const queryData = req.body;
    const { name, email, category, message } = queryData;

    // Validation
    if (!name || (!email && !queryData.phone) || !message) {
        return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    const newQuery = {
        id: Date.now().toString(),
        ...queryData,
        timestamp: new Date().toISOString()
    };

    console.log('\n--- New Shifting/Support Query Received ---');
    console.log(`From: ${name} (${email || queryData.phone})`);
    console.log(`Category: ${category}`);
    console.log(`Message: ${message}`);

    // 1. Write to local JSON file (Persistent database fallback for the demo)
    try {
        let queries = [];
        if (fs.existsSync(QUERIES_FILE)) {
            const data = fs.readFileSync(QUERIES_FILE, 'utf8');
            queries = JSON.parse(data || '[]');
        }
        queries.push(newQuery);
        fs.writeFileSync(QUERIES_FILE, JSON.stringify(queries, null, 2), 'utf8');
        console.log(`Saved locally to: ${QUERIES_FILE}`);
    } catch (err) {
        console.error('Error writing to local JSON:', err.message);
    }

    // 2. Email Sending Routing (SMTP logic)
    const receiverEmail = process.env.RECEIVER_EMAIL || 'ampy.logi21@gmail.com';
    const emailSubject = `[AMPY LOGI ${queryData.inquiryType === 'vendor' ? 'Vendor Partner' : 'Client Inquiry'}] - ${category} from ${name}`;
    
    const fieldsHtml = Object.entries(queryData)
        .filter(([k]) => !['id', 'timestamp', 'message', 'inquiryType'].includes(k))
        .map(([k, v]) => `<tr><td style="padding: 6px 12px; font-weight: bold; text-transform: capitalize; color: #555;">${k.replace(/([A-Z])/g, ' $1')}:</td><td style="padding: 6px 12px; color: #111;">${v}</td></tr>`)
        .join('');

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 650px; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #ff6b00; border-bottom: 2px solid #ff6b00; padding-bottom: 12px; margin-top: 0;">New Logistics Inquiry Received</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #f8fafc; border-radius: 8px;">
                ${fieldsHtml}
            </table>
            <div style="background-color: #fff7ed; padding: 16px; border-left: 4px solid #ff6b00; border-radius: 6px;">
                <h4 style="margin-top:0; color: #c2410c;">Details & Requirements:</h4>
                <p style="margin: 0; white-space: pre-line; font-family: monospace; color: #334155;">${message}</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 25px;"/>
            <p style="font-size: 12px; color: #64748b; text-align: center; margin-bottom: 0;">Automated notification from Ampy Logi Operating Layer</p>
        </div>
    `;

    // Try to send email
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('⚠️ SMTP credentials not configured in environment variables.');
            console.log('Sending mock email to console log:');
            console.log(`To: ${receiverEmail}`);
            console.log(`Subject: ${emailSubject}`);
            
            return res.status(200).json({ 
                message: 'Query received and logged to local queries.json! Setup SMTP environmental parameters to trigger actual email routing.' 
            });
        }

        await mailTransporter.sendMail({
            from: `"Ampy Logi System" <${process.env.SMTP_USER}>`,
            to: receiverEmail,
            subject: emailSubject,
            html: emailHtml
        });
        
        console.log(`📧 Notification email sent successfully to ${receiverEmail}`);
        res.status(200).json({ message: 'Query received and email notification dispatched successfully!' });
    } catch (mailError) {
        console.error('📧 Nodemailer Error:', mailError.message);
        // We still return 200 because we successfully captured the query locally
        res.status(200).json({ 
            message: 'Query recorded locally, but email dispatch failed. (Check server logs for SMTP errors).' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy', database: fs.existsSync(QUERIES_FILE) });
});

// Start express server
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Ampy Logi Local Demo Server listening on Port ${PORT}`);
    console.log(`👉 Open http://localhost:${PORT} in your web browser`);
    console.log(`==================================================`);
});
