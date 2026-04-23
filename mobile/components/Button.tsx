import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function Button({ onPress, title, style, textStyle, disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`bg-red-600 p-3 rounded-lg ${disabled ? 'opacity-50' : ''}`}
      style={style}
    >
      <Text className="text-white text-center font-bold" style={textStyle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
