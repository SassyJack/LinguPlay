import React from 'react';
import { StyleSheet, View, SafeAreaView, ViewStyle } from 'react-native';

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
  const customStyle = {
    paddingHorizontal: padding,
    paddingVertical: padding,
  };

  return (
    <SafeAreaView
      style={[styles.container, customStyle, style]}
      testID={testID}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default Container;
