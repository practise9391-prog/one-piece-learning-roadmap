import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { AITutorContext } from '../../models/AIAssistant';

interface FloatingAIButtonProps {
  context?: AITutorContext;
  bottomOffset?: number;
}

export const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({
  context,
  bottomOffset = 80,
}) => {
  const { navigate } = useAppNavigation();

  const handlePress = () => {
    navigate('AITutorHome', { context });
  };

  return (
    <TouchableOpacity
      style={[styles.floatingBtn, { bottom: bottomOffset }]}
      onPress={handlePress}
      activeOpacity={0.85}
      accessibilityLabel="Ask AI Tutor"
      accessibilityRole="button"
    >
      <Ionicons name="sparkles" size={16} color="#0A1128" />
      <Text style={styles.btnText}>AI Tutor</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingBtn: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 999,
  },
  btnText: {
    color: '#0A1128',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
