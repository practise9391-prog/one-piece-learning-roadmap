import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const CareerRoadmapScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Career Roadmap</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
});
