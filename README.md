# Smart Canteen Pre-Order App

A comprehensive mobile application for pre-ordering food from the canteen with an admin panel for canteen staff management.

## 🚀 Features

### User App (React Native)
- **User Authentication**: Secure login/signup with JWT tokens
- **Menu Browsing**: Browse food items by category (breakfast, lunch, snacks, beverages, dinner)
- **Item Details**: View detailed information including price, description, and preparation time
- **Cart Management**: Add items to cart, adjust quantities, and manage orders
- **Order Placement**: Place orders with preferred pickup time and special instructions
- **Order Tracking**: Track order status in real-time (pending → confirmed → preparing → ready → completed)
- **Order History**: View past orders and current order status
- **Profile Management**: User profile with order history and settings

### Admin Panel (Web)
- **Dashboard**: Overview of daily orders, revenue, and menu statistics
- **Menu Management**: Add, edit, and remove menu items
- **Order Management**: View all orders, update order status, filter by status
- **Authentication**: Secure admin login with role-based access
- **Real-time Updates**: Live order status tracking

## 📁 Project Structure

```
canteen/
├── backend/                  # Node.js Express API
│   ├── admin/               # Admin panel (HTML/CSS/JS)
│   │   ├── index.html       # Main admin dashboard
│   │   └── login.html       # Admin login page
│   ├── controllers/         # API controllers
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   └── orderController.js
│   ├── middleware/          # Express middleware
│   │   └── auth.js          # Authentication middleware
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   ├── MenuItem.js
│   │   └── Order.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── menu.js
│   │   └── orders.js
│   ├── .env                 # Environment variables
│   ├── package.json
│   ├── seed.js              # Database seeding script
│   └── server.js            # Express server
├── mobile-app/              # React Native mobile app
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context providers
│   │   │   ├── AuthContext.js
│   │   │   └── CartContext.js
│   │   ├── navigation/      # React Navigation setup
│   │   │   └── AppNavigator.js
│   │   ├── screens/         # App screens
│   │   │   ├── LoginScreen.js
│   │   │   ├── SignupScreen.js
│   │   │   ├── MenuScreen.js
│   │   │   ├── MenuItemDetailScreen.js
│   │   │   ├── CartScreen.js
│   │   │   ├── CheckoutScreen.js
│   │   │   ├── OrdersScreen.js
│   │   │   ├── OrderDetailScreen.js
│   │   │   └── ProfileScreen.js
│   │   └── services/        # API services
│   │       └── api.js
│   ├── App.js
│   ├── package.json
│   └── app.json
└── README.md
```

## 🛠 Technology Stack

### Mobile App
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform for React Native
- **React Navigation**: Screen navigation
- **Axios**: HTTP client for API requests
- **AsyncStorage**: Local data persistence
- **React Context**: State management

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing

### Admin Panel
- **HTML/CSS/JavaScript**: Pure frontend technologies
- **Fetch API**: HTTP requests
- **LocalStorage**: Token storage

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas)
- **Expo CLI** (for mobile app development)
- **React Native CLI** (optional, for native builds)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd canteen
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/canteen-app
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

#### Start MongoDB
Make sure MongoDB is running on your system:

```bash
# For local MongoDB installation
mongod

# Or using MongoDB Atlas (update MONGODB_URI in .env)
```

#### Seed Database (Optional)
Populate the database with sample data:

```bash
npm run seed
```

This creates:
- Admin user: `admin@canteen.com` / `admin123`
- Sample menu items across all categories

#### Start Backend Server
```bash
npm start
# For development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

#### Access Admin Panel
Open your browser and navigate to:
- Admin Login: `http://localhost:5000/admin`
- Login with admin credentials: `admin@canteen.com` / `admin123`

### 3. Mobile App Setup

#### Install Dependencies
```bash
cd mobile-app
npm install
```

#### Update API URL
Edit `mobile-app/src/services/api.js` and update the API URL if your backend is running on a different port/IP:

```javascript
const API_URL = 'http://localhost:5000/api';
```

#### Run the App
```bash
# Start Expo development server
npx expo start

# For Android
npx expo start --android

# For iOS (macOS only)
npx expo start --ios

# For web
npx expo start --web
```

#### Install Expo App on Mobile
1. Download the Expo Go app from App Store (iOS) or Google Play Store (Android)
2. Scan the QR code displayed in the terminal
3. The app will load in Expo Go

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Menu
- `GET /api/menu` - Get all menu items (public)
- `GET /api/menu?category=lunch` - Get menu items by category
- `GET /api/menu/:id` - Get single menu item
- `POST /api/menu` - Create menu item (admin only)
- `PUT /api/menu/:id` - Update menu item (admin only)
- `DELETE /api/menu/:id` - Delete menu item (admin only)

### Orders
- `POST /api/orders` - Create new order (protected)
- `GET /api/orders/my-orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get single order (protected)
- `PATCH /api/orders/:id/cancel` - Cancel order (protected)
- `GET /api/orders` - Get all orders (admin only)
- `PATCH /api/orders/:id/status` - Update order status (admin only)

## 👥 Default Credentials

### Admin User
- **Email**: admin@canteen.com
- **Password**: admin123
- **Role**: Admin

### Test User
You can create test users through the mobile app signup or use the seed script to create additional users.

## 🎯 User Flow

### For Users
1. **Register/Login**: Create account or login with existing credentials
2. **Browse Menu**: View available food items by category
3. **Add to Cart**: Select items and add to cart with desired quantities
4. **Checkout**: Review cart, add pickup time and special instructions
5. **Place Order**: Submit order and receive confirmation
6. **Track Order**: Monitor order status in real-time
7. **Pickup**: Collect order when status shows "Ready"

### For Admins
1. **Login**: Access admin panel with admin credentials
2. **Dashboard**: View daily statistics and overview
3. **Manage Menu**: Add, edit, or remove menu items
4. **Process Orders**: View incoming orders and update status
5. **Monitor**: Track order completion and revenue

## 🔧 Configuration

### Backend Environment Variables
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Environment (development/production)

### Mobile App Configuration
- API URL in `src/services/api.js`
- Navigation setup in `src/navigation/AppNavigator.js`
- Context providers in `src/context/`

## 🐛 Troubleshooting

### Backend Issues
- **MongoDB Connection Error**: Ensure MongoDB is running and MONGODB_URI is correct
- **Port Already in Use**: Change PORT in .env file or kill process using the port
- **CORS Errors**: Check CORS configuration in server.js

### Mobile App Issues
- **Network Request Failed**: Ensure backend is running and API URL is correct
- **Metro Bundler Issues**: Clear cache: `npx expo start -c`
- **iOS Build Issues**: Ensure Xcode is installed and properly configured
- **Android Build Issues**: Ensure Android Studio and SDK are properly installed

### Admin Panel Issues
- **Login Failed**: Check admin credentials and backend API
- **CORS Errors**: Ensure backend allows requests from admin panel origin
- **Data Not Loading**: Check browser console for errors and API connectivity

## 📱 Deployment

### Backend Deployment
1. Deploy to cloud platforms (Heroku, AWS, DigitalOcean)
2. Set environment variables in deployment platform
3. Use MongoDB Atlas for production database
4. Configure CORS for production domain

### Mobile App Deployment
1. Build standalone app using EAS Build
2. Submit to App Store (iOS) and Google Play (Android)
3. Update API URL for production backend
4. Configure app signing and certificates

## 🔐 Security Considerations

- Store sensitive data in environment variables
- Use strong JWT secrets in production
- Implement rate limiting for API endpoints
- Add input validation and sanitization
- Use HTTPS in production
- Implement proper error handling
- Add logging and monitoring

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Development Team

Smart Canteen Development Team

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.