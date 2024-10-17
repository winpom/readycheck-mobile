import { View, Text, FlatList } from 'react-native'
import React from 'react'

const Upcoming = ({ checks }) => {
  return (
    <FlatList
      data={checks}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <Text className="text-3xl text-white">
          {item.id}
        </Text>
      )}
      horizontal
    />
  )
};

export default Upcoming