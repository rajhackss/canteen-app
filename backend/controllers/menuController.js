const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// Get popular / top-selling menu items
exports.getPopularItems = async (req, res) => {
  try {
    const popularData = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          totalOrdered: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      { $unwind: { path: '$itemDetails', preserveNullAndEmptyArrays: true } }
    ]);

    res.json(popularData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching popular items', error: error.message });
  }
};

// Get all menu items
exports.getAllMenuItems = async (req, res) => {
  try {
    const { category, all } = req.query;
    const filter = {};
    if (category) filter.category = category;
    // By default return only available items for public app, unless all=true is passed (e.g. for admin panel)
    if (all !== 'true') {
      filter.available = true;
    }
    
    const menuItems = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu items', error: error.message });
  }
};

// Get single menu item
exports.getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu item', error: error.message });
  }
};

// Create new menu item (admin only)
exports.createMenuItem = async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating menu item', error: error.message });
  }
};

// Update menu item (admin only)
exports.updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: 'Error updating menu item', error: error.message });
  }
};

// Delete menu item (admin only)
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting menu item', error: error.message });
  }
};