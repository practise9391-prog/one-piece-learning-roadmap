import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export interface DropdownOption {
  label: string;
  value: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
}

interface SettingsDropdownProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value: string;
  options: DropdownOption[];
  onSelect: (val: string) => void;
  isLast?: boolean;
}

export const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  icon,
  iconColor,
  title,
  subtitle,
  value,
  options,
  onSelect,
  isLast = false,
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <>
      <TouchableOpacity
        style={[
          styles.row,
          !isLast && [styles.borderBottom, { borderBottomColor: theme.colors.divider }],
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.left}>
          {icon ? (
            <View
              style={[
                styles.iconBox,
                { backgroundColor: `${iconColor || theme.colors.primary}15` },
              ]}
            >
              <Ionicons
                name={icon}
                size={18}
                color={iconColor || theme.colors.primary}
              />
            </View>
          ) : null}

          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.right}>
          <Text style={[styles.valueText, { color: theme.colors.primary }]}>
            {selectedOption?.label || value}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={theme.colors.textTertiary}
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>

      {/* Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContent,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                    Select {title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeBtn}
                  >
                    <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item, index }) => {
                    const isSelected = item.value === value;
                    const isItemLast = index === options.length - 1;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.optionRow,
                          !isItemLast && [styles.borderBottom, { borderBottomColor: theme.colors.divider }],
                          isSelected && { backgroundColor: `${theme.colors.primary}10` },
                        ]}
                        onPress={() => {
                          onSelect(item.value);
                          setModalVisible(false);
                        }}
                      >
                        <View style={styles.optionLeft}>
                          {item.emoji ? (
                            <Text style={styles.optionEmoji}>{item.emoji}</Text>
                          ) : item.icon ? (
                            <Ionicons
                              name={item.icon}
                              size={18}
                              color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                              style={{ marginRight: 10 }}
                            />
                          ) : null}
                          <View>
                            <Text
                              style={[
                                styles.optionLabel,
                                {
                                  color: isSelected ? theme.colors.primary : theme.colors.textPrimary,
                                  fontWeight: isSelected ? '700' : '500',
                                },
                              ]}
                            >
                              {item.label}
                            </Text>
                            {item.subtitle ? (
                              <Text
                                style={[
                                  styles.optionSub,
                                  { color: theme.colors.textSecondary },
                                ]}
                              >
                                {item.subtitle}
                              </Text>
                            ) : null}
                          </View>
                        </View>

                        {isSelected ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={theme.colors.primary}
                          />
                        ) : null}
                      </TouchableOpacity>
                    );
                  }}
                  style={{ maxHeight: 360 }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 4,
  },
  chevron: {
    marginLeft: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 14,
  },
  optionSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
