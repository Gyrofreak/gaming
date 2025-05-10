require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(limiter);

// Email transporter setup with error handling
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} catch (error) {
  console.error('Failed to create email transporter:', error);
  process.exit(1);
}

// Store bookings in memory (replace with database in production)
const bookings = [];

// Helper function to check if a time slot is available
const isTimeSlotAvailable = (date, time) => {
  return !bookings.some(booking => 
    booking.date === date && booking.time === time
  );
};

// Helper function to validate date and time
const isValidDateTime = (date, time) => {
  const appointmentDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  
  // Check if date is in the past
  if (appointmentDateTime < now) {
    return false;
  }

  // Check if it's a Sunday (0 = Sunday)
  if (appointmentDateTime.getDay() === 0) {
    return false;
  }

  // Check if time is within business hours (9 AM to 6 PM, last slot 17:30)
  const hours = appointmentDateTime.getHours();
  const minutes = appointmentDateTime.getMinutes();
  if (hours < 9 || (hours === 17 && minutes > 30) || hours >= 18) {
    return false;
  }

  return true;
};

// Validation middleware
const validateBooking = [
  body('customerName').trim().notEmpty().withMessage('Name is required'),
  body('customerEmail').isEmail().withMessage('Valid email is required'),
  body('phoneNumber').matches(/^\(\d{3}\) \d{3}-\d{4}$/).withMessage('Valid phone number is required'),
  body('service').trim().notEmpty().withMessage('Service is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required')
];

// Helper function to send confirmation emails
const sendConfirmationEmails = async (booking) => {
  if (!transporter) {
    throw new Error('Email transporter not configured');
  }

  // Email to customer
  const customerMailOptions = {
    from: process.env.EMAIL_USER,
    to: booking.customerEmail,
    subject: 'Appointment Confirmation - Legend Barber Shop',
    html: `
      <h2>Appointment Confirmation</h2>
      <p>Dear ${booking.customerName},</p>
      <p>Your appointment has been confirmed with the following details:</p>
      <ul>
        <li>Service: ${booking.service}</li>
        <li>Date: ${booking.date}</li>
        <li>Time: ${booking.time}</li>
      </ul>
      <p>Location: Legend Barber Shop</p>
      <p>If you need to cancel or reschedule, please contact us as soon as possible.</p>
      <p>Thank you for choosing Legend Barber Shop!</p>
    `
  };

  // Email to shop owner
  const shopMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.SHOP_EMAIL,
    subject: 'New Appointment Booking',
    html: `
      <h2>New Appointment</h2>
      <p>A new appointment has been booked:</p>
      <ul>
        <li>Customer: ${booking.customerName}</li>
        <li>Email: ${booking.customerEmail}</li>
        <li>Phone: ${booking.phoneNumber}</li>
        <li>Service: ${booking.service}</li>
        <li>Date: ${booking.date}</li>
        <li>Time: ${booking.time}</li>
      </ul>
    `
  };

  try {
    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(shopMailOptions);
    return true;
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
  }
};

// Check availability endpoint
app.get('/api/check-availability', (req, res) => {
  const { date, time } = req.query;

  if (!date || !time) {
    return res.status(400).json({ error: 'Date and time are required' });
  }

  if (!isValidDateTime(date, time)) {
    return res.status(400).json({ 
      error: 'Invalid date or time. Please choose a future date during business hours (9 AM - 6 PM, Monday-Saturday).' 
    });
  }

  const available = isTimeSlotAvailable(date, time);
  res.json({ available });
});

// Book appointment endpoint
app.post('/api/book', validateBooking, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerName, customerEmail, service, date, time, phoneNumber } = req.body;

    // Validate date and time
    if (!isValidDateTime(date, time)) {
      return res.status(400).json({ 
        error: 'Invalid date or time. Please choose a future date during business hours (9 AM - 6 PM, Monday-Saturday).' 
      });
    }

    // Check availability
    if (!isTimeSlotAvailable(date, time)) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    // Create booking
    const booking = {
      customerName,
      customerEmail,
      service,
      date,
      time,
      phoneNumber,
      bookingId: Date.now().toString()
    };

    // Send confirmation emails
    await sendConfirmationEmails(booking);

    // Save booking
    bookings.push(booking);

    res.status(201).json({ 
      message: 'Appointment booked successfully', 
      bookingId: booking.bookingId 
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      error: 'Failed to process booking. Please try again later.' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong! Please try again later.' 
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 