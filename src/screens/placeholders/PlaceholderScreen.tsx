import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { ActionButton } from '../../components/ActionButton';
import { Colors } from '../../theme/colors';
import { useAppNavigation } from '../../navigation/NavigationContext';

interface PlaceholderScreenProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  plannedPart: string;
  description: string;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  title,
  subtitle,
  icon,
  plannedPart,
  description,
}) => {
  const { goBack } = useAppNavigation();

  return (
    <View style={styles.container}>
      <Header
        title={title}
        subtitle={subtitle || 'Upcoming Island'}
        showBack
        onBackPress={goBack}
      />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={48} color={Colors.secondary} />
        </View>
        <Text style={styles.plannedTag}>Slated for {plannedPart}</Text>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.descriptionText}>{description}</Text>

        <View style={styles.cardInfo}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.accent} />
          <Text style={styles.cardInfoText}>
            The architecture, SQLite schemas, and routing layers have been prepared for this module.
          </Text>
        </View>

        <ActionButton
          title="Return to Grand Line"
          icon="arrow-back"
          onPress={goBack}
          variant="outline"
          style={styles.backBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 179, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 179, 0, 0.3)',
    marginBottom: 20,
  },
  plannedTag: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 28,
  },
  cardInfoText: {
    fontSize: 12,
    color: Colors.accent,
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  backBtn: {
    width: '100%',
  },
});

