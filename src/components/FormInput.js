import React from 'react';
import { TextInput } from 'react-native-paper';
import {styles} from "../styles/styles";

export default function FormInput({ labelName, ...rest }) {
  return (
      <TextInput
          label={labelName}
          style={styles.input}
          numberOfLines={1}
          {...rest}
      />
  );
}
