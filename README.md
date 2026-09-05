# Smart Canteen App 🍽️

[![React Native](https://img.shields.io/badge/React_Native-0.86.3-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)](https://backend-six-amber-19.vercel.app/)

A full-stack, real-time campus cafeteria solution consisting of a cross-platform mobile pre-ordering app (Android & iOS) and an integrated Web Admin Management Dashboard.

---

## 🌐 Live Production Links

- **Backend API**: [https://backend-six-amber-19.vercel.app/api](https://backend-six-amber-19.vercel.app/api)
- **Web Admin Portal**: [https://backend-six-amber-19.vercel.app/admin/login.html](https://backend-six-amber-19.vercel.app/admin/login.html)
- **API Health Check**: [https://backend-six-amber-19.vercel.app/health](https://backend-six-amber-19.vercel.app/health)

---

## ✨ Features

### 📱 Mobile Customer App (React Native & Expo)
- **Authentication**: JWT-based user login and registration with auto-login persistence via `AsyncStorage`.
- **Category-Based Menu Browsing**: Live filtering across Breakfast, Lunch, Snacks, Beverages, and Dinner with preparation time indicators.
- **Smart Pickup Time Scheduler**:
  - 1-tap quick select chips: `⚡ 15 min`, `⏱ 30 min`, `🍴 45 min`, `🕒 1 hr`, and `✏️ Custom`.
  - Natural time parser: Accepts flexible inputs (`"4 pm"`, `"4:30 PM"`, `"16:30"`, `"25 min"`), automatically converting them to valid ISO timestamps.
  - Live pickup preview badge showing the exact scheduled time today.
- **Bottom Navigation Bar**:
  - 🍽️ **Menu**: Browse items, view details, and add to cart.
  - 🛒 **Cart**: Real-time badge counter, quantity adjustments, and total bill calculation.
  - 📋 **Orders**: Order history with live pastel status badges and pickup times.
  - 👤 **Profile**: Customer details, quick navigation, admin portal access, and logout.
- **Order Success Modal**: Full-screen receipt popup with order token `#ABC123`, pickup schedule, payment method, and instant `Track Live Order 🚀` button.
- **Live Real-Time Synchronization**:
  - Menu Screen: Polls silently every 8 seconds for new dishes and stock changes.
  - Orders Screen: Auto-refreshes every 4 seconds to reflect kitchen progress instantly without screen flicker.
  - Order Detail Screen: Live 3-second kitchen timeline updates (`Pending` → `Confirmed` → `Preparing` → `Ready` → `Completed`).
- **🛡️ Embedded In-App Admin Portal**: Built-in WebView (`AdminScreen.js`) allowing cafeteria managers to manage orders and menu items directly within the app without opening an external browser.
- **Custom Brand Identity**: Cohesive emerald theme (`#059669` / `#10B981`) with native Android adaptive launcher icons and official splash screens.

### 🛡️ Web Admin Dashboard (Vercel & Express)
- **Real-Time Metrics**: Daily gross revenue, active pending orders, preparation pipeline, and cancelled orders summary.
- **Order Cancellation Revenue Adjustment**: Automatically subtracts cancelled orders from revenue metrics with instant live recalculation.
- **Live Order Management**: Change order statuses in 1 click (`Confirmed`, `Preparing`, `Ready`, `Completed`, `Cancelled`) with confirmation alerts.
- **Menu Management**: Add new items, update prices, toggle item availability, and edit descriptions.
- **Mobile & Tablet Responsive**: Table containers with touch-friendly horizontal scrolling, adaptive stat grids, and optimized mobile layouts.
- **Auto-Refresh**: Live data refreshes in the background every 30 seconds.

---

## 📁 Project Structure

```
canteen-app/
├── backend/                       # Node.js / Express Server
│   ├── admin/                    # Admin Panel Frontend
│   │   ├── index.html            # Admin dashboard
│   │   ├── login.html            # Admin authentication
│   │   └── logo.png              # Admin brand emblem
│   ├── controllers/              # Business logic & request handling
│   │   ├── authController.js     # User registration & JWT auth
│   │   ├── menuController.js     # Menu CRUD & availability
│   │   └── orderController.js    # Order processing & smart date parsing
│   ├── middleware/               # Express middlewares
│   │   └── auth.js               # JWT verification & admin guard
│   ├── models/                   # Mongoose Schemas
│   │   ├── User.js               # Customer & Staff accounts
│   │   ├── MenuItem.js           # Dishes, prices, & categories
│   │   └── Order.js              # Order items, status, & timestamps
│   ├── routes/                   # API Route definitions
│   │   ├── auth.js               # /api/auth
│   │   ├── menu.js               # /api/menu
│   │   └── orders.js             # /api/orders
│   ├── package.json
│   ├── seed.js                   # Database seed script
│   └── server.js                 # Server entry point
├── mobile-app/                   # React Native (Expo) Client
│   ├── assets/                   # App icons & brand graphics
│   │   ├── logo.png              # Primary brand logo
│   │   ├── icon.png              # App launcher icon
│   │   ├── android-icon-foreground.png # Adaptive icon
│   │   ├── splash.png            # App splash screen
│   │   └── favicon.png           # Browser favicon
│   ├── src/
│   │   ├── context/              # Global state providers
│   │   │   ├── AuthContext.js    # Session & token storage
│   │   │   └── CartContext.js    # Cart items & calculations
│   │   ├── navigation/           # Navigation configuration
│   │   │   └── AppNavigator.js   # Bottom Tabs & Stack Navigator
│   │   ├── screens/              # UI Screen Views
│   │   │   ├── LoginScreen.js    # Customer sign-in & Admin link
│   │   │   ├── SignupScreen.js   # New customer registration
│   │   │   ├── MenuScreen.js     # Category menu & live status
│   │   │   ├── MenuItemDetailScreen.js # Item customization & add to cart
│   │   │   ├── CartScreen.js     # Cart items review & checkout entry
│   │   │   ├── CheckoutScreen.js # Pickup time chips, payment & success modal
│   │   │   ├── OrdersScreen.js   # Active & historical orders
│   │   │   ├── OrderDetailScreen.js # Real-time kitchen tracking & receipt
│   │   │   ├── ProfileScreen.js  # Account info & In-App Admin portal entry
│   │   │   └── AdminScreen.js    # Embedded In-App WebView for Admin Portal
│   │   └── services/
│   │       └── api.js            # Axios client with Vercel endpoints
│   ├── App.js                    # Root component
│   ├── app.json                  # Expo project & Android manifest config
│   ├── eas.json                  # EAS Cloud Build profiles
│   └── package.json
├── BUILD_APK.md                  # Detailed APK compilation manual
└── README.md
```

---

## 🛠 Tech Stack & Libraries

| Domain | Technology | Description |
|---|---|---|
| **Mobile Core** | React Native `0.86.3`, Expo SDK `57` | Cross-platform mobile development |
| **Navigation** | `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/stack` | Native stack and tab navigators |
| **In-App Web** | `react-native-webview` | Embedded WebView for Admin Portal |
| **Mobile State** | React Context API & `AsyncStorage` | Persistent local session & cart storage |
| **HTTP Client** | `axios` | Robust HTTP client with Bearer interceptors & 60s timeout |
| **Backend** | Node.js, Express | RESTful API server with static admin serving |
| **Database** | MongoDB Atlas with Mongoose ODM | Cloud database with schema validation |
| **Security** | `jsonwebtoken`, `bcryptjs`, CORS | Password hashing and role-based auth |
| **Deployment** | Vercel (Backend), EAS Build (Mobile APK) | Cloud deployment & continuous compilation |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g eas-cli`)

---

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/rajhackss/canteen-app.git
cd canteen-app
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
# Server starts at http://localhost:5000
# Admin panel accessible at http://localhost:5000/admin/login.html
```

#### 3. Mobile App Setup
```bash
cd ../mobile-app
npm install
```

Start the Expo development server:
```bash
npx expo start
```
- Press `a` to open on an Android emulator.
- Scan the QR code using the **Expo Go** app on your physical Android or iOS device.

---

## 📦 Compiling Android APK

The mobile app is configured for **EAS Cloud Build**, compiling standalone `.apk` packages without needing Android Studio installed locally.

### Step 1: Install EAS CLI & Login
```bash
npm install -g eas-cli
cd mobile-app
eas login
```

### Step 2: Run Preview APK Build
```bash
eas build --platform android --profile preview
```

### Step 3: Download & Install
Once the build completes (typically 5–10 minutes), EAS provides a direct download link and QR code to install the `.apk` directly onto any Android device.

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate customer or admin & receive JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |

### 🍔 Menu Management (`/api/menu`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/menu` | Public | Fetch available menu items (supports `?category=...`) |
| `GET` | `/api/menu/:id` | Public | Fetch single menu item details |
| `POST` | `/api/menu` | Admin | Create a new dish item |
| `PUT` | `/api/menu/:id` | Admin | Update dish details or toggle availability |
| `DELETE` | `/api/menu/:id` | Admin | Remove dish from menu |

### 📋 Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Customer | Place order with smart pickup time parser |
| `GET` | `/api/orders/my-orders` | Customer | Fetch current user's order history |
| `GET` | `/api/orders/:id` | Customer/Admin | Fetch specific order receipt & tracking |
| `PATCH` | `/api/orders/:id/cancel` | Customer | Cancel an active pending/confirmed order |
| `GET` | `/api/orders` | Admin | Retrieve all canteen orders |
| `PATCH` | `/api/orders/:id/status` | Admin | Advance order status (`preparing`, `ready`, etc.) |

---

## 🛡️ Security & Performance Highlights

- **AAPT2 Validated Assets**: All launcher and splash PNG images are verified with standard 8-byte PNG signatures (`89 50 4E 47 0D 0A 1A 0A`) to prevent Android resource compilation failures.
- **Fail-Safe Date Parsing**: Pickup timestamps are parsed using multi-stage regex and ISO validation on both mobile and backend, guaranteeing zero unhandled Mongoose casting exceptions.
- **Cold-Start Resilience**: Axios client incorporates a 60-second request window and graceful error messages for handling serverless wake-up latency.
- **Protected Endpoints**: Admin operations are guarded by stacked JWT authorization and role-checking middlewares.

---

## 📄 License

This project is licensed under the MIT License.