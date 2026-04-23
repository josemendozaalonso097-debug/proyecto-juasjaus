import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  placeholder: string;
}

export default function Input({ placeholder, ...props }: InputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg p-3 mb-4"
      placeholderTextColor="#999"
      {...props}
    />
  );
}
