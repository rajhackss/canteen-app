import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { menuAPI } from '../services/api';

const MenuScreen = ({ navigation }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const hasLoadedOnce = useRef(false);

  const categories = ['all', 'breakfast', 'lunch', 'snacks', 'beverages', 'dinner'];

  const budgetOptions = [
    { id: 'all', label: '💰 Any Budget' },
    { id: '50', label: '≤ ₹50' },
    { id: '100', label: '≤ ₹100' },
    { id: '150', label: '≤ ₹150' },
    { id: '200', label: '≤ ₹200' },
  ];

  // Reactive and bulletproof filter computation for category & budget
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter (case-insensitive & trimmed)
      const categoryMatch =
        selectedCategory === 'all' ||
        String(item.category || '').trim().toLowerCase() === selectedCategory.toLowerCase();

      // Budget filter (numerical price comparison)
      if (selectedBudget === 'all') {
        return categoryMatch;
      }
      const maxBudget = parseFloat(selectedBudget);
      const itemPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
      const budgetMatch = !isNaN(itemPrice) && itemPrice <= maxBudget;

      return categoryMatch && budgetMatch;
    });
  }, [menuItems, selectedCategory, selectedBudget]);

  const loadMenuItems = async (silent = false) => {
    try {
      if (!silent && !hasLoadedOnce.current) {
        setLoading(true);
      }
      const response = await menuAPI.getAll();
      const items = response.data || [];
      setMenuItems(items);
      hasLoadedOnce.current = true;
    } catch (error) {
      if (!silent) {
        console.error('Error loading menu:', error);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Real-time updates: fetch on focus and poll silently every 8 seconds
  useFocusEffect(
    useCallback(() => {
      loadMenuItems(hasLoadedOnce.current);

      const interval = setInterval(() => {
        loadMenuItems(true);
      }, 8000);

      return () => clearInterval(interval);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMenuItems(false);
    setRefreshing(false);
  };

  const filterByCategory = (category) => {
    setSelectedCategory(category);
  };

  const filterByBudget = (budget) => {
    setSelectedBudget(budget);
  };

  const renderMenuItem = ({ item }) => {
    const isSoldOut = item.isAvailable === false;

    return (
      <TouchableOpacity
        style={[styles.menuItem, isSoldOut && styles.menuItemSoldOut]}
        onPress={() => !isSoldOut && navigation.navigate('MenuItemDetail', { item })}
        activeOpacity={isSoldOut ? 0.9 : 0.7}
      >
        <View style={styles.menuItemContent}>
          <View style={styles.menuItemInfo}>
            <View style={styles.titleRow}>
              <Text style={[styles.menuItemName, isSoldOut && styles.menuItemNameSoldOut]}>
                {item.name}
              </Text>
              {isSoldOut ? (
                <View style={styles.soldOutBadge}>
                  <Text style={styles.soldOutText}>🚫 Sold Out</Text>
                </View>
              ) : (
                <View style={styles.liveStockBadge}>
                  <View style={styles.greenDot} />
                  <Text style={styles.liveStockText}>Live</Text>
                </View>
              )}
            </View>

            <Text style={styles.menuItemDescription} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.menuItemMeta}>
              <Text style={styles.menuItemPrice}>₹{item.price}</Text>
              <Text style={styles.menuItemTime}>
                ⏱ {item.preparationTime || 10} min
              </Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>
                  ⭐ {item.numReviews > 0 && item.rating > 0 ? Number(item.rating).toFixed(1) : 'New'}
                </Text>
                {item.numReviews > 0 ? (
                  <Text style={styles.reviewsCount}>({item.numReviews})</Text>
                ) : null}
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addButton, isSoldOut && styles.addButtonDisabled]}
            onPress={() => !isSoldOut && navigation.navigate('MenuItemDetail', { item })}
            disabled={isSoldOut}
          >
            <Text style={styles.addButtonText}>{isSoldOut ? '✕' : '+'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive,
      ]}
      onPress={() => filterByCategory(category)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category && styles.categoryButtonTextActive,
        ]}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderBudgetButton = (b) => (
    <TouchableOpacity
      key={b.id}
      style={[
        styles.budgetButton,
        selectedBudget === b.id && styles.budgetButtonActive,
      ]}
      onPress={() => filterByBudget(b.id)}
    >
      <Text
        style={[
          styles.budgetButtonText,
          selectedBudget === b.id && styles.budgetButtonTextActive,
        ]}
      >
        {b.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F43F5E" />
        <Text style={styles.loadingText}>Loading live menu...</Text>
      </View>
    );
  }

    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.brandContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.headerLogo}
                resizeMode="cover"
              />
            </View>
            <View>
              <Text style={styles.headerTitle}>Smart Canteen</Text>
              <Text style={styles.headerSubtitle}>Real-time live ordering</Text>
            </View>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live Sync</Text>
          </View>
        </View>
      </View>

      {/* Category Filter Bar */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={({ item }) => renderCategoryButton(item)}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
        />

        {/* Budget Mode Chips (Feature 7) */}
        <View style={styles.budgetRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={budgetOptions}
            renderItem={({ item }) => renderBudgetButton(item)}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.budgetList}
          />
        </View>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.menuList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F43F5E', '#F59E0B', '#2563EB']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>No dishes match your selected filters</Text>
            <Text style={styles.emptySub}>Try picking another category or budget limit</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6', // Blue secondary
  },
  header: {
    backgroundColor: '#FFB800', // Yellow primary
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  headerLogo: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827', // Dark contrast on yellow
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827', // Dark contrast
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EC4899', // Pink pulse
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterSection: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6', // Blue secondary
    borderColor: '#3B82F6',
    elevation: 4,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '700',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  budgetRow: {
    paddingTop: 8,
  },
  budgetList: {
    paddingHorizontal: 16,
  },
  budgetButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#FDF2F8', // Light pink
    borderWidth: 1.5,
    borderColor: '#FBCFE8',
  },
  budgetButtonActive: {
    backgroundColor: '#EC4899', // Pink primary
    borderColor: '#EC4899',
    elevation: 3,
    shadowColor: '#EC4899',
    shadowOpacity: 0.3,
  },
  budgetButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DB2777', // Darker pink text
  },
  budgetButtonTextActive: {
    color: '#FFFFFF',
  },
  menuList: {
    padding: 16,
    paddingBottom: 40,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  menuItemSoldOut: {
    backgroundColor: '#F9FAFB',
    opacity: 0.6,
  },
  menuItemContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  menuItemInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingRight: 6,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  menuItemNameSoldOut: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  soldOutBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  soldOutText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
  },
  liveStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginRight: 4,
  },
  liveStockText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  menuItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFB800', // Yellow primary
  },
  menuItemTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6', // Blue secondary
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F8', // Light pink
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DB2777', // Dark pink
  },
  reviewsCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BE185D',
    marginLeft: 3,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EC4899', // Pink Primary
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    elevation: 4,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addButtonDisabled: {
    backgroundColor: '#E5E7EB',
    elevation: 0,
    shadowOpacity: 0,
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: -2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default MenuScreen;