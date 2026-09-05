import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  Linking,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, settingsAPI } from '../services/api';

// Helper to convert natural time or chips into ISO string and friendly preview
const parseTimeInput = (input) => {
  if (!input) return null;

  // If numeric or relative like "15" or "15 mins"
  const relMatch = String(input).trim().match(/^(?:in\s*)?(\d+)\s*(m|min|mins|minutes|h|hr|hrs|hours)?$/i);
  if (relMatch) {
    const val = parseInt(relMatch[1], 10);
    const unit = (relMatch[2] || 'm').toLowerCase();
    const minutes = unit.startsWith('h') ? val * 60 : val;
    const target = new Date(Date.now() + minutes * 60 * 1000);
    return {
      iso: target.toISOString(),
      display: target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // If "4 pm", "4:30 pm", "16:30", "4"
  const timeMatch = String(input).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // If time already passed today by more than 5 minutes, assume next day or keep today
    if (target.getTime() < Date.now() - 5 * 60 * 1000) {
      target.setDate(target.getDate() + 1);
    }
    return {
      iso: target.toISOString(),
      display: target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // Try direct date parse
  const direct = new Date(input);
  if (!isNaN(direct.getTime()) && direct.getFullYear() > 2020) {
    return {
      iso: direct.toISOString(),
      display: direct.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  return null;
};

const CheckoutScreen = ({ navigation }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  
  // Quick chip options
  const quickTimeOptions = [
    { id: '15', label: '⚡ 15 min', minutes: 15 },
    { id: '30', label: '⏱ 30 min', minutes: 30 },
    { id: '45', label: '🍴 45 min', minutes: 45 },
    { id: '60', label: '🕒 1 hr', minutes: 60 },
    { id: 'custom', label: '✏️ Custom', minutes: null },
  ];

  const [selectedQuickTime, setSelectedQuickTime] = useState('15');
  const [customTimeText, setCustomTimeText] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isExpressPickup, setIsExpressPickup] = useState(false);
  const [canteenSettings, setCanteenSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  // Success modal state
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.get();
      if (res.data) setCanteenSettings(res.data);
    } catch (err) {
      console.log('Error fetching canteen settings:', err);
    }
  };

  // Kitchen wait-time estimation based on cart items
  const estimatedKitchenTime = cartItems.reduce(
    (max, item) => Math.max(max, item.menuItem?.preparationTime || 10),
    10
  );

  // Determine current pickup time info
  const getActivePickupTime = () => {
    if (selectedQuickTime !== 'custom') {
      const option = quickTimeOptions.find((o) => o.id === selectedQuickTime);
      const minutes = option ? option.minutes : 15;
      const target = new Date(Date.now() + minutes * 60 * 1000);
      return {
        iso: target.toISOString(),
        display: target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } else {
      return parseTimeInput(customTimeText);
    }
  };

  const activeTimeInfo = getActivePickupTime();

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items before placing an order.');
      return;
    }

    if (selectedQuickTime === 'custom' && !customTimeText.trim()) {
      Alert.alert('Pickup Time Required', 'Please enter a pickup time (e.g. 4:30 PM).');
      return;
    }

    const timeInfo = getActivePickupTime();
    const finalPickupTime = timeInfo ? timeInfo.iso : new Date(Date.now() + 20 * 60 * 1000).toISOString();

    try {
      setLoading(true);

      const orderData = {
        items: cartItems.map((item) => ({
          menuItemId: item.menuItem._id,
          quantity: item.quantity,
        })),
        pickupTime: finalPickupTime,
        specialInstructions,
        paymentMethod,
        isExpressPickup,
      };

      const response = await orderAPI.create(orderData);
      
      const createdOrder = response.data;
      clearCart();

      // Trigger rich success overlay
      setOrderSuccess({
        orderId: createdOrder._id,
        pickupDisplay: timeInfo ? timeInfo.display : 'In ~20 mins',
        totalAmount: createdOrder.totalAmount,
        paymentMethod: createdOrder.paymentMethod,
        itemsCount: createdOrder.items?.length || cartItems.length,
        pickupCounter: createdOrder.pickupCounter || (isExpressPickup ? 'Express Shelf' : 'Counter 1'),
        isExpressPickup: createdOrder.isExpressPickup,
        estimatedWaitTime: createdOrder.estimatedPrepTime || estimatedKitchenTime,
      });
    } catch (error) {
      Alert.alert(
        'Order Failed',
        error.response?.data?.message || 'Unable to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Order Items Section */}
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

          {/* Wait-Time Display */}
          <View style={styles.waitTimeBadge}>
            <Text style={styles.waitTimeIcon}>⏱️</Text>
            <Text style={styles.waitTimeText}>
              Est. Kitchen Wait-Time:{' '}
              <Text style={styles.waitTimeBold}>~{estimatedKitchenTime} mins</Text>
            </Text>
          </View>
        </View>

        {/* Express Pickup Option */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.expressCard, isExpressPickup && styles.expressCardActive]}
            onPress={() => setIsExpressPickup(!isExpressPickup)}
            activeOpacity={0.8}
          >
            <View style={styles.expressHeader}>
              <View style={styles.expressTitleRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.expressIcon}>⚡</Text>
                  <Text style={styles.expressTitle}>Express Fast Pickup</Text>
                </View>
                <View style={[styles.switchTrack, isExpressPickup && styles.switchTrackActive]}>
                  <View style={[styles.switchThumb, isExpressPickup && styles.switchThumbActive]} />
                </View>
              </View>
              <Text style={styles.expressDesc}>
                Priority grab-and-go! Your order will be placed directly on the dedicated Express Pickup Shelf as soon as ready.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Pickup Time Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Pickup Time</Text>
          <Text style={styles.inputSubtitle}>
            When would you like to collect your meal from the counter?
          </Text>

          {/* Quick Select Chips */}
          <View style={styles.chipsContainer}>
            {quickTimeOptions.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.chip,
                  selectedQuickTime === opt.id && styles.chipSelected,
                ]}
                onPress={() => setSelectedQuickTime(opt.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedQuickTime === opt.id && styles.chipTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Time Input if selected */}
          {selectedQuickTime === 'custom' && (
            <View style={styles.customInputContainer}>
              <Text style={styles.inputLabel}>Enter Specific Time</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 4:30 PM, 16:00, or 25 min"
                placeholderTextColor="#94A3B8"
                value={customTimeText}
                onChangeText={setCustomTimeText}
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Live Preview Badge */}
          {activeTimeInfo && (
            <View style={styles.pickupPreviewBadge}>
              <Text style={styles.pickupPreviewIcon}>⏱</Text>
              <Text style={styles.pickupPreviewText}>
                Ready for pickup at{' '}
                <Text style={styles.pickupPreviewBold}>{activeTimeInfo.display}</Text> today
              </Text>
            </View>
          )}

          <Text style={[styles.inputLabel, { marginTop: 14 }]}>Special Instructions (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Less spicy, extra tissue, pack separately, etc."
            placeholderTextColor="#94A3B8"
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Payment Method Section - Card Option REMOVED per requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cashless & Payment Methods</Text>
          <View style={styles.paymentGrid}>
            {[
              { id: 'cash', label: '💵 Cash at Counter', sub: 'Pay cash when collecting your food' },
              { id: 'upi', label: '📱 Instant UPI / QR Payment', sub: 'Pay seamlessly via GPay, PhonePe, Paytm' },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.paymentOption,
                  paymentMethod === option.id && styles.paymentOptionSelected,
                ]}
                onPress={() => setPaymentMethod(option.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.paymentOptionText,
                      paymentMethod === option.id && styles.paymentOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.paymentOptionSub}>{option.sub}</Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    paymentMethod === option.id && styles.radioCircleSelected,
                  ]}
                >
                  {paymentMethod === option.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Canteen QR Code & UPI Details (Feature 4) */}
          {paymentMethod === 'upi' && (
            <View style={styles.upiContainer}>
              <View style={styles.upiHeader}>
                <Text style={styles.upiBadge}>⚡ SCAN & PAY</Text>
                <Text style={styles.upiMerchant}>
                  Merchant: {canteenSettings?.upiName || 'Campus Smart Canteen'}
                </Text>
              </View>

              <View style={styles.qrWrapper}>
                <Image
                  source={{
                    uri:
                      canteenSettings?.upiQrCode ||
                      `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                        'upi://pay?pa=' +
                          (canteenSettings?.upiId || 'canteen@upi') +
                          '&pn=' +
                          encodeURIComponent(canteenSettings?.upiName || 'Campus Canteen') +
                          '&am=' +
                          getCartTotal() +
                          '&cu=INR'
                      )}`,
                  }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.upiIdRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.upiIdLabel}>Official UPI ID</Text>
                  <Text style={styles.upiIdValue}>
                    {canteenSettings?.upiId || 'canteen@okaxis'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => {
                    Alert.alert(
                      'UPI ID Copied',
                      `Copied: ${canteenSettings?.upiId || 'canteen@okaxis'}\nUse in any UPI app to pay.`
                    );
                  }}
                >
                  <Text style={styles.copyButtonText}>📋 Copy</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.payUpiAppButton}
                onPress={() => {
                  const upiUrl = `upi://pay?pa=${encodeURIComponent(
                    canteenSettings?.upiId || 'canteen@okaxis'
                  )}&pn=${encodeURIComponent(
                    canteenSettings?.upiName || 'Campus Canteen'
                  )}&am=${getCartTotal()}&cu=INR`;
                  Linking.openURL(upiUrl).catch(() => {
                    Alert.alert(
                      'UPI Payment',
                      `Please scan the QR code above or pay to ${canteenSettings?.upiId || 'canteen@okaxis'} using Google Pay, PhonePe, or Paytm.`
                    );
                  });
                }}
              >
                <Text style={styles.payUpiAppText}>🚀 Pay with UPI App (GPay / PhonePe)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <Text style={styles.addressText}>👤 {user?.name || 'Customer'}</Text>
          {user?.phone ? <Text style={styles.addressText}>📞 {user?.phone}</Text> : null}
          <Text style={styles.addressText}>✉️ {user?.email || ''}</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Place Order Bottom Bar */}
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

      {/* Beautiful Order Placed Success Modal */}
      {orderSuccess && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successCard}>
              {/* Glowing Success Badge */}
              <View style={styles.successIconRing}>
                <View style={styles.successIconBadge}>
                  <Text style={styles.successCheckmark}>✓</Text>
                </View>
              </View>

              <Text style={styles.successTitle}>Order Placed Successfully!</Text>
              <Text style={styles.successSubtitle}>
                Your order has been sent to the canteen kitchen.
              </Text>

              {/* Digital Receipt Card */}
              <View style={styles.receiptCard}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Order Token</Text>
                  <Text style={styles.receiptToken}>
                    #{orderSuccess.orderId.slice(-6).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.receiptDivider} />

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Estimated Pickup</Text>
                  <Text style={styles.receiptHighlight}>
                    ⏱ {orderSuccess.pickupDisplay}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Payment Method</Text>
                  <Text style={styles.receiptValue}>
                    {orderSuccess.paymentMethod.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Pickup Counter</Text>
                  <Text style={styles.receiptCounterBadge}>
                    📍 {orderSuccess.pickupCounter || (orderSuccess.isExpressPickup ? 'Express Shelf' : 'Counter 1')}
                  </Text>
                </View>

                {orderSuccess.isExpressPickup && (
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Order Type</Text>
                    <Text style={styles.receiptExpressBadge}>⚡ EXPRESS PICKUP</Text>
                  </View>
                )}

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Total Payable</Text>
                  <Text style={styles.receiptAmount}>
                    ₹{orderSuccess.totalAmount}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.trackButton}
                onPress={() => {
                  const id = orderSuccess.orderId;
                  setOrderSuccess(null);
                  navigation.replace('OrderDetail', { orderId: id });
                }}
              >
                <Text style={styles.trackButtonText}>Track Live Order 🚀</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                  setOrderSuccess(null);
                  navigation.navigate('Menu');
                }}
              >
                <Text style={styles.menuButtonText}>Back to Menu 🍽️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    marginBottom: 6,
  },
  inputSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextSelected: {
    color: '#059669',
    fontWeight: '700',
  },
  customInputContainer: {
    marginTop: 4,
  },
  pickupPreviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 6,
  },
  pickupPreviewIcon: {
    fontSize: 14,
  },
  pickupPreviewText: {
    fontSize: 13,
    color: '#065F46',
  },
  pickupPreviewBold: {
    fontWeight: '700',
    color: '#047857',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F8FAFC',
  },
  paymentOptionSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  paymentOptionText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
  },
  paymentOptionTextSelected: {
    color: '#059669',
    fontWeight: '700',
  },
  paymentOptionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#10B981',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
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

  /* Order Success Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  successIconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIconBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  successCheckmark: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  successSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  receiptLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  receiptToken: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 15,
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  receiptHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  trackButton: {
    backgroundColor: '#059669',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  menuButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  menuButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  /* Wait-Time Display */
  waitTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    gap: 8,
  },
  waitTimeIcon: {
    fontSize: 16,
  },
  waitTimeText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
  },
  waitTimeBold: {
    fontWeight: '800',
    color: '#78350F',
  },
  /* Express Pickup Card */
  expressCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
  },
  expressCardActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  expressHeader: {
    width: '100%',
  },
  expressTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  expressIcon: {
    fontSize: 18,
  },
  expressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  expressDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: '#F59E0B',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  /* UPI & QR Code Styles */
  upiContainer: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  upiHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  upiBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  upiMerchant: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  qrImage: {
    width: 190,
    height: 190,
  },
  upiIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
    marginBottom: 12,
  },
  upiIdLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  upiIdValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  payUpiAppButton: {
    backgroundColor: '#059669',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  payUpiAppText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  receiptCounterBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  receiptExpressBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
});

export default CheckoutScreen;