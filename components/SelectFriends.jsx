import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '../context/GlobalProvider';
import { getFriends } from "../lib/appwrite";

const SelectFriends = ({ selectedUsers, setSelectedUsers, visible, setVisible }) => {
  const { user } = useGlobalContext();
  const [friends, setFriends] = useState([]);
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await getFriends(user.$id);
        setFriends(response.map(friend => ({
          id: friend.id,
          diplayName: friend.displayName,
          username: friend.username,
          avatarUrl: friend.avatar,
        })));
      } catch (error) {
        Alert.alert("Error", "Could not load friends.");
      }
    };
    fetchFriends();
  }, [user.$id]);

  // Update tempSelectedUsers whenever the modal opens with current selected users
  useEffect(() => {
    if (visible) {
      setTempSelectedUsers([...selectedUsers]);
    }
  }, [visible, selectedUsers]);

  const toggleUserSelection = (userId) => {
    if (tempSelectedUsers.includes(userId)) {
      setTempSelectedUsers(tempSelectedUsers.filter(id => id !== userId));
    } else {
      setTempSelectedUsers([...tempSelectedUsers, userId]);
    }
  };

  const handleConfirmSelection = () => {
    setSelectedUsers(tempSelectedUsers);
    setVisible(false);
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <SafeAreaView className="flex-1 justify-center items-center bg-primary bg-opacity-50">
        <View className="bg-white rounded-lg p-4 w-4/5 max-h-[80%]">
          <Text className="text-lg font-bold mb-4 text-center">Select Friends</Text>
          <ScrollView>
            {friends.map(friend => (
              <TouchableOpacity
                key={friend.id}
                className="flex-row items-center"
                onPress={() => toggleUserSelection(friend.id)}
              >
                <CheckBox
                  checked={tempSelectedUsers.includes(friend.id)}
                  onPress={() => toggleUserSelection(friend.id)}
                  containerStyle={{ marginRight: 10, padding: 0 }}
                />
                {friend.avatarUrl ? (
                  <Image
                    source={{ uri: friend.avatarUrl }}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                ) : (
                  <View className="w-8 h-8 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                    <Text className="text-gray-700">{friend.displayName[0] || friend.username[0]}</Text>
                  </View>
                )}
                <Text className="text-gray-800">{friend.displayName || friend.username}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View className="flex-row justify-between mt-4">
            <TouchableOpacity
              onPress={() => setVisible(false)}
              className="p-2 bg-gray-300 rounded"
            >
              <Text className="text-center text-gray-800">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirmSelection}
              className="p-2 bg-blue-500 rounded"
            >
              <Text className="text-center text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SelectFriends;