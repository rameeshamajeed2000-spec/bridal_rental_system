# Bridal Connect

## Intelligent Bridal Rental and Booking System

Bridal Connect is a comprehensive web-based application developed to simplify and modernize bridal shopping, bridal product rentals, and wedding service bookings.

The system provides a centralized platform where users can browse bridal products, book wedding services, check availability, make online payments, and use an AI-based virtual try-on feature. The application includes separate functionality for users, artists, vendors, and administrators.

## Features

### User

* User registration and login
* Browse bridal dresses, jewellery, footwear, and accessories
* Search and filter bridal products
* Check product availability
* Book bridal products
* Book makeup artists
* Book mehendi artists
* Add products to cart
* Secure online payment using Razorpay
* AI-based virtual try-on
* Upload an image to preview selected bridal outfits
* View booking history
* Manage profile and bookings

### Artist and Vendor

* Artist and vendor registration and login
* Manage artist and vendor profiles
* Add service details and pricing
* Upload work portfolios
* Manage availability
* View customer booking requests
* Manage appointments

### Administrator

* Admin dashboard
* Manage users
* Manage artists and vendors
* Manage bridal products
* Add, update, and remove dresses, jewellery, and footwear
* Manage bookings
* Monitor transactions
* Manage system data
* View analytics and reports

## AI-Based Virtual Try-On

Bridal Connect includes an AI-based virtual try-on feature that allows users to upload their image and preview how a selected bridal outfit may appear before making a booking decision.

### Virtual Try-On Workflow

```text
Upload Image
     |
Select Bridal Outfit
     |
Image Processing
     |
AI Virtual Try-On
     |
Generated Preview
     |
Booking Decision
```

## Technologies Used

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Tailwind CSS

### Backend

* Python
* Flask
* REST API

### Database

* MySQL
* MySQL Workbench

### AI and Image Processing

* Fashn AI
* OpenCV
* Image Processing Techniques

### Payment Integration

* Razorpay

### Development Tools

* Visual Studio Code
* Git
* GitHub
* npm

## Project Structure

```text
bridal_rental_system/
|
├── backend/
│   ├── app.py
│   ├── add_admin.py
│   ├── db_utils.py
│   ├── init_db.py
│   ├── migrate_db.py
│   ├── fix_db_paths.py
│   └── ...
|
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── ...
|
├── scratch/
|
├── .gitignore
└── README.md
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/rameeshamajeed2000-spec/bridal_rental_system.git
cd bridal_rental_system
```

## Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install the required packages:

```bash
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file inside the `backend` directory:

```text
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
REPLICATE_API_KEY=your_replicate_key
FASHN_API_KEY=your_fashn_key
```

Do not commit the `.env` file or expose API credentials.

## Database Setup

Create the MySQL database and configure the local database connection.

Initialize the database:

```bash
python init_db.py
```

If required, run the database migration:

```bash
python migrate_db.py
```

## Run the Backend

```bash
python app.py
```

## Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the required packages:

```bash
npm install
```

Start the frontend:

```bash
npm start
```

## Security

Sensitive credentials are managed using environment variables and excluded from version control.

Never commit:

* API keys
* API secrets
* Database passwords
* Payment credentials
* `.env` files

## Objectives

* Provide a centralized platform for bridal products and wedding services.
* Simplify bridal shopping and rental processes.
* Reduce the need to visit multiple vendors.
* Provide convenient online booking and payment.
* Allow users to check product and service availability.
* Provide an AI-based virtual try-on experience.
* Provide dedicated dashboards for users, artists, vendors, and administrators.

## Future Enhancements

* Mobile application
* Improved AI-based virtual try-on
* AI-based makeup visualization
* Real-time chat between customers and vendors
* Booking notifications
* Reviews and ratings
* Location-based vendor recommendations
* Additional payment gateway integrations
* Cloud deployment

## Project Status

This project was developed as an academic and portfolio project to demonstrate full-stack web development, database management, payment integration, role-based functionality, and AI-based image processing.

## Developer

Rameesha Vp

MCA
