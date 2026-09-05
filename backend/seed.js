const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const User = require('./models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await MenuItem.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@canteen.com',
      password: 'admin123',
      phone: '1234567890',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create menu items
    const menuItems = [
      {
        name: 'Masala Dosa',
        description: 'Crispy rice crepe filled with spiced potato filling',
        price: 40,
        category: 'breakfast',
        image: '',
        preparationTime: 15
      },
      {
        name: 'Idli Sambar',
        description: 'Steamed rice cakes served with lentil soup',
        price: 30,
        category: 'breakfast',
        image: '',
        preparationTime: 10
      },
      {
        name: 'Veg Thali',
        description: 'Complete meal with rice, dal, vegetables, and roti',
        price: 80,
        category: 'lunch',
        image: '',
        preparationTime: 20
      },
      {
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with spiced chicken',
        price: 120,
        category: 'lunch',
        image: '',
        preparationTime: 25
      },
      {
        name: 'Samosa',
        description: 'Crispy pastry filled with spiced potatoes',
        price: 15,
        category: 'snacks',
        image: '',
        preparationTime: 10
      },
      {
        name: 'Veg Sandwich',
        description: 'Grilled sandwich with fresh vegetables',
        price: 35,
        category: 'snacks',
        image: '',
        preparationTime: 8
      },
      {
        name: 'Masala Chai',
        description: 'Traditional Indian spiced tea',
        price: 10,
        category: 'beverages',
        image: '',
        preparationTime: 5
      },
      {
        name: 'Cold Coffee',
        description: 'Chilled coffee with ice cream',
        price: 45,
        category: 'beverages',
        image: '',
        preparationTime: 5
      },
      {
        name: 'Paneer Butter Masala',
        description: 'Creamy paneer curry with butter',
        price: 90,
        category: 'dinner',
        image: '',
        preparationTime: 20
      },
      {
        name: 'Naan',
        description: 'Soft Indian bread',
        price: 20,
        category: 'dinner',
        image: '',
        preparationTime: 8
      }
    ];

    await MenuItem.insertMany(menuItems);
    console.log('Created menu items');

    console.log('Seed data completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();