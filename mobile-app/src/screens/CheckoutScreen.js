import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';

const CheckoutScreen = ({ navigation }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [pickupTime, setPickupTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!pickupTime) {
      Alert.alert('Error', 'Please select a pickup time');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        items: cartItems.map(item => ({
          menuItemId: item.menuItem._id,
          quantity: item.quantity,
        })),
        pickupTime,
        specialInstructions,
        paymentMethod,
      };

      const response = await orderAPI.create(orderData);
      
      clearCart();
      Alert.alert(
        'Order Placed Successfully!',
        `Your order #${response.data._id} has been placed.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Orders'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to place order'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.itemName}>{item.menuItem.name}</Text>
      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
      <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item.menuItem._id} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.menuItem.name}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalAmount}>₹{getCartTotal()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Details</Text>
          <Text style={styles.inputLabel}>Pickup Time</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 12:30 PM (or in 15 mins)"
            placeholderTextColor="#94A3B8"
            value={pickupTime}
            onChangeText={setPickupTime}
          />

          <Text style={styles.inputLabel}>Special Instructions (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Less spicy, extra chutney, etc."
            placeholderTextColor="#94A3B8"
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentGrid}>
            {[
              { id: 'cash', label: '💵 Cash at Counter' },
              { id: 'upi', label: '📱 UPI Payment' },
              { id: 'card', label: '💳 Card' },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.paymentOption,
                  paymentMethod === option.id && styles.paymentOptionSelected,
                ]}
                onPress={() => setPaymentMethod(option.id)}
              >
                <Text
                  style={[
                    styles.paymentOptionText,
                    paymentMethod === option.id && styles.paymentOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Contact</Text>
          <Text style={styles.addressText}>👤 {user?.name || 'Customer'}</Text>
          {user?.phone ? <Text style={styles.addressText}>📞 {user?.phone}</Text> : null}
          <Text style={styles.addressText}>✉️ {user?.email || ''}</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderButtonText}>
              Confirm & Place Order • ₹{getCartTotal()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#64748B',
    marginHorizontal: 10,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: '#059669',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#059669',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 12,
    fontSize: 15,
    color: '#1E293B',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  paymentGrid: {
    gap: 8,
  },
  paymentOption: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 13,
    backgroundColor: '#F8FAFC',
  },
  paymentOptionSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  paymentOptionText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  paymentOptionTextSelected: {
    color: '#059669',
    fontWeight: '700',
  },
  addressText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  placeOrderButton: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#A7F3D0',
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CheckoutScreen;