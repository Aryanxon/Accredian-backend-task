require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// Referral API Endpoint
app.post('/api/refer', async (req, res) => {
    try {
        const { referrerName, referrerEmail, refereeName, refereeEmail, course } = req.body;
        
        // Validation
        if (!referrerName || !referrerEmail || !refereeName || !refereeEmail || !course) {
            return res.status(400).json({ error: 'All fields are required!' });
        }
        
        // Save referral data in MySQL using Prisma
        const referral = await prisma.referral.create({
            data: { referrerName, referrerEmail, refereeName, refereeEmail, course }
        });
        
        // Send Referral Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: refereeEmail,
            subject: 'You have been referred to a course!',
            text: `${referrerName} has referred you for the course: ${course}. Contact them at ${referrerEmail}.`
        };
        
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Referral submitted and email sent!', referral , status: '201'});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error!', status: '500' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
