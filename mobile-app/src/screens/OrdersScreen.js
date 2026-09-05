import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { orderAPI } from '../services/api';

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedOnce = useRef(false);

  const loadOrders = async (silent = false) => {
    try {
      if (!silent && !hasLoadedOnce.current) {
        setLoading(true);
      }
      const response = await orderAPI.getMyOrders();
      setOrders(response.data);
      hasLoadedOnce.current = true;
    } catch (error) {
      if (!silent) {
        console.error('Error loading orders:', error);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Real-time updates: fetch when screen is focused and poll silently every 4 seconds
  useFocusEffect(
    useCallback(() => {
      loadOrders(hasLoadedOnce.current);

      const interval = setInterval(() => {
        loadOrders(true);
      }, 4000);

      return () => clearInterval(interval);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders(false);
    setRefreshing(false);
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
        return { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' };
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
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return String(time);
  };

  const renderOrderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.orderItem}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
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
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          {item.items.slice(0, 3).map((orderItem, index) => (
            <Text key={index} style={styles.orderItemText}>
              • {orderItem.menuItem?.name || 'Dish'} <Text style={styles.itemQty}>x{orderItem.quantity}</Text>
            </Text>
          ))}
          {item.items.length > 3 && (
            <Text style={styles.moreItemsText}>
              +{item.items.length - 3} more items
            </Text>
          )}
        </View>

        <View style={styles.metaBadgesRow}>
          <View style={styles.counterBadge}>
            <Text style={styles.counterBadgeText}>
              📍 {item.pickupCounter || (item.isExpressPickup ? 'Express Shelf' : 'Counter 1')}
            </Text>
          </View>
          {item.isExpressPickup && (
            <View style={styles.expressTag}>
              <Text style={styles.expressTagText}>⚡ Express</Text>
            </View>
          )}
          {item.rating ? (
            <View style={styles.ratedTag}>
              <Text style={styles.ratedTagText}>⭐ {item.rating}/5</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={[styles.orderTotal, item.status === 'cancelled' && styles.orderTotalCancelled]}>
              ₹{item.totalAmount}
            </Text>
          </View>
          <View style={styles.pickupContainer}>
            <Text style={styles.pickupLabel}>Pickup Time</Text>
            <Text style={styles.pickupTime}>
              ⏱ {formatPickupTime(item.pickupTime)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>📋 My Orders</Text>
            <Text style={styles.headerSubtitle}>Real-time kitchen order tracking</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>
      </View>

      {/* Global Ready Alert Banner if any active order is ready */}
      {orders.some((o) => o.status === 'ready') && (
        <TouchableOpacity
          style={styles.globalReadyBanner}
          activeOpacity={0.85}
          onPress={() => {
            const readyOrder = orders.find((o) => o.status === 'ready');
            if (readyOrder) navigation.navigate('OrderDetail', { orderId: readyOrder._id });
          }}
        >
          <Text style={styles.globalReadyIcon}>🔔</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.globalReadyTitle}>Your Meal is Ready!</Text>
            <Text style={styles.globalReadySub}>
              Collect at {orders.find((o) => o.status === 'ready')?.pickupCounter || 'Counter 1'}. Tap to open.
            </Text>
          </View>
          <Text style={styles.globalReadyArrow}>➔</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F59E0B', '#F43F5E', '#2563EB']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders placed yet</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Menu')}
            >
              <Text style={styles.browseButtonText}>Browse Menu</Text>
            </TouchableOpacity>
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
    backgroundColor: '#F59E0B',
    paddingTop: 45,
    paddingBottom: 16,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
    marginRight: 5,
  },
  liveText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ordersList: {
    padding: 16,
  },
  orderItem: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  orderDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 14,
  },
  orderItemText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  itemQty: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  moreItemsText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D97706',
  },
  orderTotalCancelled: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  pickupContainer: {
    alignItems: 'flex-end',
  },
  pickupLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  pickupTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: '#F43F5E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  globalReadyBanner: {
    backgroundColor: '#FFF1F2',
    borderWidth: 2,
    borderColor: '#F43F5E',
    borderRadius: 14,
    margin: 16,
    marginBottom: 4,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 3,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  globalReadyIcon: {
    fontSize: 26,
  },
  globalReadyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#BE123C',
  },
  globalReadySub: {
    fontSize: 12,
    color: '#9F1239',
    marginTop: 2,
  },
  globalReadyArrow: {
    fontSize: 18,
    color: '#F43F5E',
    fontWeight: 'bold',
  },
  metaBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  counterBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  counterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
  },
  expressTag: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  expressTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  ratedTag: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#854D0E',
  },
});

export default OrdersScreen;