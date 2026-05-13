import React from 'react';
import { StyleSheet, View, SafeAreaView, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

interface ContainerProps {
  children: React.ReactNode;
  padding?: number;
  style?: ViewStyle;
  testID?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  padding = 16,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const customStyle = {
    paddingHorizontal: padding,
    paddingVertical: padding,
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }, customStyle, style]}
      testID={testID}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Container;
