import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const selectedCategoryRef = useRef('all');
  const selectedBudgetRef = useRef('all');
  const hasLoadedOnce = useRef(false);

  selectedCategoryRef.current = selectedCategory;
  selectedBudgetRef.current = selectedBudget;

  const categories = ['all', 'breakfast', 'lunch', 'snacks', 'beverages', 'dinner'];

  const budgetOptions = [
    { id: 'all', label: '💰 Any Budget' },
    { id: '50', label: '≤ ₹50' },
    { id: '100', label: '≤ ₹100' },
    { id: '150', label: '≤ ₹150' },
    { id: '200', label: '≤ ₹200' },
  ];

  const applyFilters = (items, category, budget) => {
    let result = items;
    if (category !== 'all') {
      result = result.filter(item => item.category === category);
    }
    if (budget !== 'all') {
      const maxPrice = Number(budget);
      result = result.filter(item => Number(item.price) <= maxPrice);
    }
    return result;
  };

  const loadMenuItems = async (silent = false) => {
    try {
      if (!silent && !hasLoadedOnce.current) {
        setLoading(true);
      }
      const response = await menuAPI.getAll();
      const items = response.data || [];
      setMenuItems(items);
      
      setFilteredItems(applyFilters(items, selectedCategoryRef.current, selectedBudgetRef.current));
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
    setFilteredItems(applyFilters(menuItems, category, selectedBudget));
  };

  const filterByBudget = (budget) => {
    setSelectedBudget(budget);
    setFilteredItems(applyFilters(menuItems, selectedCategory, budget));
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
                  ⭐ {item.rating ? Number(item.rating).toFixed(1) : '4.5'}
                </Text>
                {item.numReviews ? (
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
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading live menu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.brandContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
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
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },
  header: {
    backgroundColor: '#059669',
    paddingTop: 45,
    paddingBottom: 16,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  headerLogo: {
    width: 38,
    height: 38,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 5,
  },
  liveText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingTop: 10,
    paddingBottom: 8,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryButtonActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  categoryButtonText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  budgetRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  budgetList: {
    paddingHorizontal: 16,
  },
  budgetButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  budgetButtonActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  budgetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  budgetButtonTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  menuList: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  menuItemSoldOut: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.75,
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
    marginBottom: 4,
    paddingRight: 6,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 6,
  },
  menuItemNameSoldOut: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  soldOutBadge: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  soldOutText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  liveStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  liveStockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  menuItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  menuItemPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#059669',
  },
  menuItemTime: {
    fontSize: 11,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  reviewsCount: {
    fontSize: 10,
    color: '#92400E',
    marginLeft: 2,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButtonDisabled: {
    backgroundColor: '#CBD5E1',
    elevation: 0,
  },
  addButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: -2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default MenuScreen;