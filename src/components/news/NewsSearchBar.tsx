import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface NewsSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const NewsSearchBar: React.FC<NewsSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search headlines, topics, sources...',
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={18} color="#94A3B8" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
});
