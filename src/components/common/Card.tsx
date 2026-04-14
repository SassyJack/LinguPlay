import React from 'react';
import { StyleSheet, View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: any;
  testID?: string;
}

const Card: React.FC<CardProps> = ({ children, style, testID }) => {
  return (
    <View style={[styles.card, style]} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Card;
