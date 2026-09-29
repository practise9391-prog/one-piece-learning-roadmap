import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HrInterviewPrepScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HR Interview Prep</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
});
