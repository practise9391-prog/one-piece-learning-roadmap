import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface CourseIconProps {
  courseId: string;
  size?: number;
  color?: string;
  containerStyle?: StyleProp<ViewStyle>;
  showBackground?: boolean;
}

export const CourseIcon: React.FC<CourseIconProps> = ({
  courseId,
  size = 28,
  color,
  containerStyle,
  showBackground = false,
}) => {
  const normalizedId = courseId.toLowerCase().replace(/-/g, '_');

  // Match icon name based on course
  const getIconMeta = (): { name: keyof typeof MaterialCommunityIcons.glyphMap; defaultColor: string; bg: string } => {
    switch (normalizedId) {
      case 'python':
        return { name: 'language-python', defaultColor: '#3776AB', bg: '#EFF6FF' };
      case 'dsa':
        return { name: 'graph-outline', defaultColor: '#DC2626', bg: '#FEF2F2' };
      case 'git':
        return { name: 'git', defaultColor: '#F05032', bg: '#FFF7ED' };
      case 'sql':
        return { name: 'database', defaultColor: '#0284C7', bg: '#F0F9FF' };
      case 'django':
        return { name: 'alpha-d-box-outline', defaultColor: '#092E20', bg: '#ECFDF5' };
      case 'ml_developer':
      case 'ml':
        return { name: 'brain', defaultColor: '#7C3AED', bg: '#F5F3FF' };
      case 'linux':
        return { name: 'linux', defaultColor: '#CA8A04', bg: '#FEFCE8' };
      case 'frappe':
        return { name: 'layers-outline', defaultColor: '#2563EB', bg: '#EFF6FF' };
      case 'aptitude_reasoning':
      case 'aptitude':
        return { name: 'calculator-variant', defaultColor: '#D97706', bg: '#FFFBEB' };
      case 'english':
        return { name: 'book-open-page-variant', defaultColor: '#0D9488', bg: '#F0FDFA' };
      case 'hindi':
        return { name: 'translate', defaultColor: '#EA580C', bg: '#FFF7ED' };
      case 'html':
        return { name: 'language-html5', defaultColor: '#E34F26', bg: '#FFF7ED' };
      case 'css':
        return { name: 'language-css3', defaultColor: '#1572B6', bg: '#F0F9FF' };
      case 'javascript':
      case 'js':
        return { name: 'language-javascript', defaultColor: '#CA8A04', bg: '#FEFCE8' };
      default:
        return { name: 'compass-outline', defaultColor: Colors.primary, bg: '#FEF2F2' };
    }
  };

  const meta = getIconMeta();
  const iconColor = color || meta.defaultColor;

  if (showBackground) {
    const bgSize = size * 1.8;
    return (
      <View
        style={[
          styles.bgContainer,
          {
            width: bgSize,
            height: bgSize,
            borderRadius: bgSize / 2,
            backgroundColor: meta.bg,
          },
          containerStyle,
        ]}
      >
        <MaterialCommunityIcons name={meta.name} size={size} color={iconColor} />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <MaterialCommunityIcons name={meta.name} size={size} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  bgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
