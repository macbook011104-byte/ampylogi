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
    const { name, email, category, message } = req.body;

    // Simple validation
    if (!name || !email || !category || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const newQuery = {
        id: Date.now().toString(),
        name,
        email,
        category,
        message,
        timestamp: new Date().toISOString()
    };

    console.log('\n--- New Shifting/Support Query Received ---');
    console.log(`From: ${name} (${email})`);
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
    const receiverEmail = process.env.RECEIVER_EMAIL || 'ampy.logi21@gmail.com'; // Business email from presentation deck
    const emailSubject = `[AMPY LOGI Inquiry] - ${category} from ${name}`;
    
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
            <h2 style="color: #ff9800; border-bottom: 2px solid #ff9800; padding-bottom: 10px;">New Inquiry Received</h2>
            <p><strong>Customer Name:</strong> ${name}</p>
            <p><strong>Email Address:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Query Category:</strong> ${category}</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; margin-top: 15px;">
                <p style="margin: 0; font-style: italic;">"${message}"</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;"/>
            <p style="font-size: 11px; color: #888; text-align: center;">This message was generated automatically by the Ampy Logi Backend System.</p>
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
