# **Bridal Connect**

## **Intelligent Bridal Rental and Booking System**

Bridal Connect is a comprehensive web-based application designed to simplify and modernize bridal shopping, product rentals, and wedding service bookings through a single platform. The system connects customers, artists and vendors, and administrators while providing online booking, product management, secure payments, and AI-based virtual try-on functionality.

## **Features**

### **User**

- User registration and login
- Browse bridal dresses, jewellery, footwear, and accessories
- Check product availability
- Book bridal products and wedding services
- Book makeup artists and mehendi artists
- Add products to cart
- Secure online payment using Razorpay
- AI-based virtual try-on for bridal outfits
- Upload an image and preview selected outfits
- View booking history
- Track reservations through the user dashboard

### **Artist and Vendor**

- Artist and vendor registration and login
- Manage professional profiles
- Manage service availability
- Add service pricing and details
- Upload work portfolios
- View customer requests
- Manage appointments and bookings
- Access artist and vendor dashboards

### **Administrator**

- Admin dashboard for system management
- Manage users and artist accounts
- Approve and monitor registrations
- Add, update, and remove bridal products
- Manage dresses, jewellery, and footwear
- Manage bookings and transactions
- Monitor system activities
- Generate analytics and reports

## **AI-Based Virtual Try-On**

Bridal Connect includes an AI-based virtual try-on feature that allows users to upload their image and preview selected bridal outfits before making a rental or booking decision.

### **Workflow**

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

## **Technologies Used**

### **Frontend**

- React.js
- JavaScript
- HTML5
- CSS3
- Tailwind CSS

### **Backend**

- Python
- Flask
- REST API

### **Database**

- MySQL
- MySQL Workbench

### **AI and Image Processing**

- Fashn AI
- OpenCV
- Image Processing Techniques

### **Payment Integration**

- Razorpay

### **Development Tools**

- Visual Studio Code
- Git
- GitHub
- npm

## **Project Structure**

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
│   └── tailwind.config.js
|
├── scratch/
|
└── README.md
Installation
Clone the Repository
git clone https://github.com/rameeshamajeed2000-spec/bridal_rental_system.git
cd bridal_rental_system
Backend Setup

Navigate to the backend directory:

cd backend

Create a Python virtual environment:

python -m venv venv

Activate the virtual environment on Windows:

venv\Scripts\activate

Install the required dependencies:

pip install -r requirements.txt
Environment Variables

Create a .env file inside the backend directory:

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
REPLICATE_API_KEY=your_replicate_key
FASHN_API_KEY=your_fashn_key

Do not commit the .env file or expose API credentials in the repository.

Database Setup

Create the required MySQL database and configure the database connection according to your local environment.

Initialize the database:

python init_db.py

Run database migrations if required:

python migrate_db.py
Run the Backend
python app.py
Frontend Setup

Open a new terminal and navigate to the frontend directory:

cd frontend

Install the dependencies:

npm install

Start the React development server:

npm start
Security

Sensitive credentials are managed using environment variables and are excluded from version control.

The following information should never be committed to the repository:

API keys
API secrets
Database passwords
Payment credentials
.env files
Objectives
Provide a centralized platform for bridal products and wedding services.
Simplify bridal shopping and rental processes.
Reduce the need to visit multiple vendors.
Provide convenient online booking and payment.
Allow users to check product and service availability.
Provide an AI-based virtual try-on experience.
Provide dedicated dashboards for users, artists, vendors, and administrators.
Future Enhancements
Mobile application
Improved AI-based virtual try-on
AI-based makeup visualization
Real-time chat between customers and vendors
Booking notifications
Reviews and ratings
Location-based vendor recommendations
Additional payment gateway integrations
Cloud deployment
Project Status

This project was developed as an academic and portfolio project to demonstrate full-stack web development, database management, payment integration, role-based functionality, and AI-based image processing.

Developer

Rameesha Vp

MCA 
