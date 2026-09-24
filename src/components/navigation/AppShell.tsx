import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { TopAppBar } from './TopAppBar';
import { BottomNavBar } from './BottomNavBar';
import { DrawerMenu } from './DrawerMenu';
import { Colors } from '../../theme/colors';

interface AppShellProps {
  title?: string;
  hideTopBar?: boolean;
  hideBottomBar?: boolean;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  title,
  hideTopBar = false,
  hideBottomBar = false,
  children,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {!hideTopBar && <TopAppBar title={title} />}
        <View style={styles.content}>{children}</View>
        {!hideBottomBar && <BottomNavBar />}
        <DrawerMenu />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.oceanDepths,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});
