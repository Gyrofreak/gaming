# Legend Barber Shop Booking System

This is the server component of the Legend Barber Shop booking system. It handles appointment bookings and sends confirmation emails to customers and the shop owner.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Gmail credentials:
   - Go to your Google Account settings
   - Enable 2-Step Verification if not already enabled
   - Generate an App Password:
     - Go to Security settings
     - Under "2-Step Verification", click on "App passwords"
     - Select "Mail" and "Other (Custom name)"
     - Enter a name for the app (e.g., "Legend Barber Shop")
     - Copy the generated password

3. Create a `.env` file in the root directory with the following content:
```
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your-app-password
SHOP_EMAIL=shop.owner@gmail.com
```

Replace `your.email@gmail.com` with your Gmail address, `your-app-password` with the app password generated in step 2, and `shop.owner@gmail.com` with the shop owner's email address.

## Running the Server

Start the server by running:
```bash
npm start
```

The server will run on port 3000 by default.

## API Endpoints

### Check Time Slot Availability
```
GET /api/check-availability
Query parameters:
- date: Date in YYYY-MM-DD format
- time: Time in HH:mm format
```

### Book Appointment
```
POST /api/book
Body:
{
  "customerName": "string",
  "customerEmail": "string",
  "service": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "phoneNumber": "string"
}
``` 