import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';

const MenuItemDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const isSoldOut = item.isAvailable === false;
  const itemPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;

  const addToCartHandler = () => {
    if (isSoldOut) {
      Alert.alert('Item Sold Out', 'Sorry, this dish is currently out of stock.');
      return;
    }
    addToCart(item, quantity);
    Alert.alert('Added to Cart', `${quantity} x ${item.name} added to cart`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>🍽️</Text>
        </View>

        <View style={styles.details}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.name, isSoldOut && { color: '#94A3B8' }]}>{item.name}</Text>
            {isSoldOut ? (
              <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ color: '#DC2626', fontWeight: '800', fontSize: 12 }}>🚫 SOLD OUT</Text>
              </View>
            ) : (
              <View style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ color: '#2563EB', fontWeight: '800', fontSize: 12 }}>🟢 IN STOCK</Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Text style={styles.category}>
              {item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'General'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
              <Text style={{ color: '#B45309', fontWeight: '700', fontSize: 12 }}>
                ⭐ {item.numReviews > 0 && item.rating > 0 ? Number(item.rating).toFixed(1) : 'New Dish'}
              </Text>
              {item.numReviews > 0 ? (
                <Text style={{ color: '#92400E', fontSize: 11, marginLeft: 3 }}>({item.numReviews} reviews)</Text>
              ) : null}
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{itemPrice}</Text>
            <Text style={styles.prepTime}>
              ⏱ {item.preparationTime || 10} min prep
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          {!isSoldOut && (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={decreaseQuantity}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              
              <Text style={styles.quantity}>{quantity}</Text>
              
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={increaseQuantity}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>₹{itemPrice * quantity}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addToCartButton, isSoldOut && { backgroundColor: '#CBD5E1' }]}
          onPress={addToCartHandler}
          disabled={isSoldOut}
        >
          <Text style={styles.addToCartButtonText}>
            {isSoldOut ? '🚫 Currently Sold Out' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
  },
  imagePlaceholder: {
    height: 220,
    backgroundColor: '#FFFBEB', // Light yellow
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  imagePlaceholderText: {
    fontSize: 72,
  },
  details: {
    padding: 24,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
    flex: 1,
    marginRight: 10,
  },
  category: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6', // Blue secondary
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFB800', // Yellow primary
    marginRight: 16,
  },
  prepTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6', // Blue secondary
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 24,
    color: '#3B82F6', // Blue secondary
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginHorizontal: 32,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFB800', // Yellow primary
  },
  footer: {
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  addToCartButton: {
    backgroundColor: '#EC4899', // Pink primary
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default MenuItemDetailScreen;