import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { orderAPI } from '../services/api';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);

  const loadOrderDetail = async (silent = false) => {
    try {
      if (!silent && !hasLoadedOnce.current) {
        setLoading(true);
      }
      const response = await orderAPI.getById(orderId);
      setOrder(response.data);
      hasLoadedOnce.current = true;
    } catch (error) {
      if (!silent) {
        console.error('Error loading order detail:', error);
        Alert.alert('Error', 'Failed to load order details');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Real-time updates: fetch on focus and poll silently every 3 seconds
  useFocusEffect(
    useCallback(() => {
      loadOrderDetail(hasLoadedOnce.current);

      const interval = setInterval(() => {
        loadOrderDetail(true);
      }, 3000);

      return () => clearInterval(interval);
    }, [orderId])
  );

  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const handleRateOrder = async () => {
    try {
      setSubmittingRating(true);
      await orderAPI.rate(orderId, {
        rating: selectedRating,
        feedback: ratingFeedback,
      });
      Alert.alert('Thank You!', 'Your rating & feedback has been submitted.');
      setRatingModalVisible(false);
      loadOrderDetail();
    } catch (err) {
      Alert.alert('Rating Error', err.response?.data?.message || 'Could not submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleCancelOrder = async () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await orderAPI.cancel(orderId);
              Alert.alert('Success', 'Order cancelled successfully');
              loadOrderDetail();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'confirmed':
        return { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' };
      case 'preparing':
        return { bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF' };
      case 'ready':
        return { bg: '#ECFDF5', text: '#047857', border: '#6EE7B7' };
      case 'completed':
        return { bg: '#F0FDF4', text: '#166534', border: '#86EFAC' };
      case 'cancelled':
        return { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' };
      default:
        return { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
    }
  };

  const formatPickupTime = (time) => {
    if (!time) return 'As soon as ready';
    const d = new Date(time);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString([], {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
      });
    }
    return String(time);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const statusStyle = getStatusStyle(order.status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Order #{order._id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.headerSubtitle}>
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live Tracking</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* 🔔 Ready Alert Banner (Feature 3) */}
        {order.status === 'ready' && (
          <View style={styles.readyAlertBanner}>
            <View style={styles.readyAlertHeader}>
              <Text style={styles.readyAlertIcon}>🔔</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.readyAlertTitle}>ORDER IS READY FOR PICKUP!</Text>
                <Text style={styles.readyAlertDesc}>
                  Your food is packed and waiting at {order.pickupCounter || 'Counter 1'}.
                </Text>
              </View>
            </View>
            <View style={styles.readyAlertCallout}>
              <Text style={styles.readyAlertCalloutText}>
                👉 Collect from <Text style={{ fontWeight: '800', color: '#047857' }}>{order.pickupCounter || 'Counter 1'}</Text> with Token <Text style={{ fontWeight: '800', color: '#047857' }}>#{order._id.slice(-6).toUpperCase()}</Text>
              </Text>
            </View>
          </View>
        )}

        {/* 📍 Pickup Counter Guide Card (Feature 12) */}
        <View style={styles.counterGuideCard}>
          <View style={styles.counterGuideHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.counterGuideIcon}>📍</Text>
              <Text style={styles.counterGuideTitle}>Pickup Counter Guide</Text>
            </View>
            {order.isExpressPickup && (
              <View style={styles.expressBadge}>
                <Text style={styles.expressBadgeText}>⚡ EXPRESS PICKUP</Text>
              </View>
            )}
          </View>

          <View style={styles.counterDisplayBox}>
            <Text style={styles.counterDisplayLabel}>Assigned Counter</Text>
            <Text style={styles.counterDisplayName}>
              {order.pickupCounter || (order.isExpressPickup ? 'Express Shelf' : 'Counter 1')}
            </Text>
            <Text style={styles.counterDisplaySub}>
              {order.pickupCounter?.includes('2')
                ? 'Counter 2 (Beverages & Quick Bites Station)'
                : order.pickupCounter?.includes('Express') || order.isExpressPickup
                ? 'Express Grab-and-Go Shelf (Fast Lane)'
                : 'Counter 1 (Main Food & Meals Serving Counter)'}
            </Text>
          </View>

          {order.estimatedPrepTime ? (
            <View style={styles.counterWaitRow}>
              <Text style={styles.counterWaitIcon}>⏱️</Text>
              <Text style={styles.counterWaitText}>
                Est. Kitchen Prep-Time: <Text style={{ fontWeight: '700', color: '#78350F' }}>~{order.estimatedPrepTime} mins</Text>
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusStyle.bg,
                  borderColor: statusStyle.border,
                },
              ]}
            >
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Time:</Text>
              <Text style={styles.infoValue}>
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pickup Scheduled:</Text>
              <Text style={styles.infoValue}>
                {formatPickupTime(order.pickupTime)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Method:</Text>
              <Text style={styles.infoValue}>
                {order.paymentMethod.toUpperCase()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Status:</Text>
              <Text style={styles.infoValue}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* ⭐ Food Rating Section (Feature 9) */}
        {order.status === 'completed' && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingSectionTitle}>⭐ Food Quality Rating</Text>
            {order.rating ? (
              <View style={styles.ratedBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Text key={s} style={{ fontSize: 20 }}>
                      {s <= order.rating ? '⭐' : '☆'}
                    </Text>
                  ))}
                  <Text style={styles.ratedScore}>{order.rating}/5</Text>
                </View>
                {order.ratingFeedback ? (
                  <Text style={styles.ratedFeedback}>"{order.ratingFeedback}"</Text>
                ) : null}
                <Text style={styles.ratedThanks}>Thank you for rating your meal!</Text>
              </View>
            ) : (
              <View style={styles.unratedBox}>
                <Text style={styles.unratedText}>
                  How was your meal? Help other students with your rating!
                </Text>
                <TouchableOpacity
                  style={styles.openRateButton}
                  onPress={() => setRatingModalVisible(true)}
                >
                  <Text style={styles.openRateButtonText}>⭐ Rate Food & Experience</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.menuItem?.name || 'Item'}</Text>
                <Text style={styles.itemPrice}>₹{item.price} each</Text>
              </View>
              <View style={styles.itemQuantity}>
                <Text style={styles.quantityText}>x{item.quantity}</Text>
                <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        {order.specialInstructions ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <Text style={styles.instructions}>{order.specialInstructions}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Items Subtotal:</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Taxes & Fees:</Text>
            <Text style={styles.totalValue}>₹0</Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalLabel}>Grand Total:</Text>
            <Text style={styles.finalTotalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>

        {['pending', 'confirmed'].includes(order.status) && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelOrder}
          >
            <Text style={styles.cancelButtonText}>Cancel This Order</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Food Rating Modal */}
      <Modal
        visible={ratingModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ratingModalCard}>
            <Text style={styles.ratingModalTitle}>Rate Your Meal ⭐</Text>
            <Text style={styles.ratingModalSub}>
              Order #{order._id.slice(-6).toUpperCase()}
            </Text>

            {/* Interactive Stars */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setSelectedRating(star)}
                  style={styles.starTouch}
                >
                  <Text style={[styles.starIcon, selectedRating >= star && styles.starIconActive]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.starLabel}>
              {selectedRating === 5
                ? '🤩 Outstanding & Delicious!'
                : selectedRating === 4
                ? '😋 Good & Tasty'
                : selectedRating === 3
                ? '🙂 Average'
                : selectedRating === 2
                ? '😕 Below Expectations'
                : '😞 Poor Quality'}
            </Text>

            <TextInput
              style={styles.feedbackInput}
              placeholder="Tell us what you liked or how to improve..."
              placeholderTextColor="#94A3B8"
              value={ratingFeedback}
              onChangeText={setRatingFeedback}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setRatingModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, submittingRating && { opacity: 0.6 }]}
                onPress={handleRateOrder}
                disabled={submittingRating}
              >
                {submittingRating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit Rating</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
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
  headerTitle: {
    fontSize: 20,
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
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
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
  statusContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  orderInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
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
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#64748B',
  },
  itemQuantity: {
    alignItems: 'flex-end',
  },
  quantityText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  instructions: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  totalValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },
  finalTotal: {
    borderTopWidth: 1.5,
    borderTopColor: '#059669',
    paddingTop: 10,
    marginTop: 6,
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  finalTotalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#059669',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 6,
    elevation: 2,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  /* 🔔 Ready Alert Banner Styles */
  readyAlertBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  readyAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  readyAlertIcon: {
    fontSize: 30,
  },
  readyAlertTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: -0.3,
  },
  readyAlertDesc: {
    fontSize: 13,
    color: '#047857',
    marginTop: 2,
  },
  readyAlertCallout: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  readyAlertCalloutText: {
    fontSize: 13,
    color: '#1E293B',
  },

  /* 📍 Pickup Counter Guide Styles */
  counterGuideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  counterGuideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  counterGuideIcon: {
    fontSize: 18,
  },
  counterGuideTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  expressBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  expressBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  counterDisplayBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    marginBottom: 8,
  },
  counterDisplayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  counterDisplayName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E3A8A',
    marginVertical: 3,
  },
  counterDisplaySub: {
    fontSize: 12,
    color: '#3B82F6',
    lineHeight: 16,
  },
  counterWaitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  counterWaitIcon: {
    fontSize: 15,
  },
  counterWaitText: {
    fontSize: 13,
    color: '#92400E',
  },

  /* ⭐ Food Rating Section Styles */
  ratingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  ratingSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  ratedBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  ratedScore: {
    fontSize: 16,
    fontWeight: '800',
    color: '#92400E',
    marginLeft: 6,
  },
  ratedFeedback: {
    fontSize: 14,
    color: '#78350F',
    fontStyle: 'italic',
    marginVertical: 4,
  },
  ratedThanks: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '600',
    marginTop: 4,
  },
  unratedBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  unratedText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  openRateButton: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  openRateButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Food Rating Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  ratingModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    elevation: 10,
  },
  ratingModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  ratingModalSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  starTouch: {
    padding: 4,
  },
  starIcon: {
    fontSize: 34,
    color: '#CBD5E1',
  },
  starIconActive: {
    color: '#F59E0B',
  },
  starLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 14,
  },
  feedbackInput: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSubmitButton: {
    flex: 2,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default OrderDetailScreen;