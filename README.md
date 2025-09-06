# Panchakarma Management Software

A comprehensive web application for managing Panchakarma treatments, built with modern web technologies.

## Features

- **User Authentication & Management**: Secure login for patients, practitioners, and admins
- **Patient Management**: Complete patient profiles with health information
- **Practitioner Management**: Professional profiles and availability scheduling
- **Appointment Scheduling**: Book and manage appointments with conflict detection
- **Treatment Planning**: Create and track Panchakarma treatment plans
- **Notifications**: Automated SMS, email, and in-app notifications
- **Feedback System**: Collect and analyze treatment feedback
- **Analytics & Reporting**: Business intelligence and performance metrics
- **Admin Panel**: System administration and user management

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MySQL** database
- **JWT** for authentication
- **bcrypt** for password hashing
- **multer** for file uploads
- **nodemailer** for email notifications

### Frontend
- **React** with **Vite**
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Toastify** for notifications
- **React Hook Form** for form handling

## Project Structure

```
panchakarma-app/
├── backend/
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── uploads/           # File upload directory
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context for state management
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # App entry point
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   └── index.html         # HTML template
├── database/
│   └── schema.sql         # Database schema and sample data
└── README.md              # This file
```

## Setup Instructions

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MySQL** (v5.7 or higher)
3. **Git**

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=panchakarma_db
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   JWT_SECRET=your_jwt_secret_key
   ```

4. Set up the database:
   - Create a MySQL database named `panchakarma_db`
   - Run the schema file:
     ```bash
     mysql -u root -p panchakarma_db < ../database/schema.sql
     ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Patients
- `GET /api/patients` - Get all patients (admin/practitioner only)
- `POST /api/patients` - Create patient profile

### Practitioners
- `GET /api/practitioners` - Get all practitioners
- `POST /api/practitioners` - Create practitioner profile

### Appointments
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Book new appointment

### Treatment Plans
- `GET /api/treatment-plans` - Get treatment plans
- `POST /api/treatment-plans` - Create treatment plan

### File Upload
- `POST /api/upload` - Upload files

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and authentication
- `patients` - Patient profiles and health information
- `practitioners` - Practitioner profiles and credentials
- `appointments` - Appointment scheduling and management
- `treatment_plans` - Panchakarma treatment plans
- `treatment_sessions` - Individual treatment sessions
- `notifications` - Notification system
- `feedback` - Patient feedback and ratings
- `billing` - Financial transactions and billing
- `user_preferences` - User notification preferences

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for patients, practitioners, and admins
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers for Express

## Ayurvedic Features

- **Dosha Assessment**: Vata, Pitta, Kapha analysis
- **Prakriti/Vikriti**: Constitution and imbalance tracking
- **Panchakarma Protocols**: Three-phase treatment tracking
- **Ayurvedic Metrics**: Traditional health measurements
- **Treatment Effectiveness**: Outcome tracking and analysis

## Development Roadmap

### Phase 1: Core MVP ✅
- User authentication and management
- Basic patient and practitioner profiles
- Appointment scheduling
- Treatment plan creation

### Phase 2: Enhanced Features
- Advanced notification system
- Feedback and rating collection
- Analytics dashboard
- File upload and document management

### Phase 3: Advanced Features
- Video consultation integration
- Payment gateway integration
- Mobile app development
- Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
