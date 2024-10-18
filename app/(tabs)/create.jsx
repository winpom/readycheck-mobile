import { View, Text } from 'react-native'
import React from 'react'

import { DatePicker } from '../components/nativewindui/DatePicker';

const CreateReadyCheck = () => {
  const [date, setDate] = React.useState(new Date());
  return (
    <View>
      <Text>Create ReadyCheck</Text>
      <DatePicker
        value={date}
        mode="datetime"
        onChange={(ev) => {
          setDate(new Date(ev.nativeEvent.timestamp));
        }}
      />
    </View>
  );
}

export default CreateReadyCheck