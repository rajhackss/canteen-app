import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { feedbackAPI } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();

  // Feedback Modal State (Feature 10)
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('overall');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const categories = [
    { id: 'overall', label: '🌟 Overall' },
    { id: 'service', label: '⚡ Speed' },
    { id: 'food', label: '🍔 Quality' },
    { id: 'hygiene', label: '🧼 Cleanliness' },
    { id: 'staff', label: '🤝 Staff' },
  ];

  const handleSubmitFeedback = async () => {
    if (!feedbackComment.trim()) {
      Alert.alert('Comment Required', 'Please share a brief note about your experience.');
      return;
    }

    try {
      setSubmittingFeedback(true);
      await feedbackAPI.submit({
        rating: feedbackRating,
        category: feedbackCategory,
        comment: feedbackComment,
      });

      Alert.alert(
        'Feedback Received! 💬',
        'Thank you! Your feedback helps us continually improve campus dining.'
      );
      setFeedbackComment('');
      setFeedbackModalVisible(false);
    } catch (error) {
      Alert.alert(
        'Submission Failed',
        error.response?.data?.message || 'Could not send feedback. Please try again.'
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: '📋',
      title: 'My Orders',
      onPress: () => navigation.navigate('Orders'),
    },
    {
      icon: '🛒',
      title: 'My Cart',
      onPress: () => navigation.navigate('Cart'),
      badge: getCartCount() > 0 ? getCartCount() : null,
    },
    {
      icon: '💬',
      title: 'Canteen Digital Feedback',
      onPress: () => setFeedbackModalVisible(true),
    },
    {
      icon: '🛡️',
      title: 'Admin Portal',
      onPress: () => navigation.navigate('Admin'),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>👤 My Profile</Text>
          <Text style={styles.headerSubtitle}>Account & preferences</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          {user?.phone ? <Text style={styles.userPhone}>{user?.phone}</Text> : null}
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'STUDENT'}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.brandingFooter}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.version}>Smart Canteen App • v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Canteen Digital Feedback Modal (Feature 10) */}
      <Modal
        visible={feedbackModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackModalCard}>
            <Text style={styles.modalTitle}>Campus Canteen Feedback 💬</Text>
            <Text style={styles.modalSubtitle}>
              Help us enhance meals, counter service speed & hygiene.
            </Text>

            {/* Category Chips */}
            <Text style={styles.inputHeading}>Feedback Category</Text>
            <View style={styles.categoriesRow}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.categoryChip,
                    feedbackCategory === c.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setFeedbackCategory(c.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      feedbackCategory === c.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating Stars */}
            <Text style={styles.inputHeading}>Overall Service Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setFeedbackRating(star)}
                  style={styles.starTouch}
                >
                  <Text
                    style={[
                      styles.starIcon,
                      feedbackRating >= star && styles.starIconActive,
                    ]}
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Comments Input */}
            <Text style={styles.inputHeading}>Your Experience & Suggestions</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share details regarding food taste, counter queues, or staff..."
              placeholderTextColor="#94A3B8"
              value={feedbackComment}
              onChangeText={setFeedbackComment}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, submittingFeedback && { opacity: 0.6 }]}
                onPress={handleSubmitFeedback}
                disabled={submittingFeedback}
              >
                {submittingFeedback ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Feedback</Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  avatarText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chevron: {
    fontSize: 22,
    color: '#94A3B8',
    fontWeight: '300',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  brandingFooter: {
    alignItems: 'center',
    marginVertical: 20,
  },
  footerLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginBottom: 8,
    opacity: 0.85,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
  },

  /* Feedback Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  feedbackModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    width: '100%',
    maxWidth: 380,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  inputHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  categoryChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  starTouch: {
    padding: 4,
  },
  starIcon: {
    fontSize: 32,
    color: '#CBD5E1',
  },
  starIconActive: {
    color: '#F59E0B',
  },
  commentInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#1E293B',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  submitBtn: {
    flex: 2,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;