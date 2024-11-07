import { Text, Alert, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router"

import { useGlobalContext } from '../../context/GlobalProvider';
import { updateUser } from '../../lib/appwrite';
import { FormField, CustomButton } from "../../components";
// import * as ImagePicker from 'expo-image-picker';

const EditProfile = () => {
  const { user, setUser } = useGlobalContext();
  const [displayName, setDisplayName] = useState('');
  // const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatar = user.avatar || icons.defaultAvatar;

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  // const selectAvatar = async () => {
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 0.5,
  //   });

  //   if (!result.canceled) {
  //     setAvatarUri(result.assets[0].uri);
  //   }
  // };

  const handleUpdateProfile = async () => {
    setIsSubmitting(true);
    try {
      const updatedData = {
        displayName,
        avatar,
        ...(password && { password }),
      };

      const updatedUser = await updateUser(user.$id, updatedData);
      setUser({ ...user, displayName });
      Alert.alert('Success', 'Profile updated successfully!');
      router.push("/myProfile")
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full px-5 pt-5">
      <TouchableOpacity onPress={() => router.push("/myProfile")}>
        <Text className="text-white text-lg mb-3">Back</Text>
      </TouchableOpacity>
      <Text className="text-center text-secondary text-3xl mb-8">Edit Profile</Text>

      {/* Avatar Section */}
      {/* <TouchableOpacity onPress={selectAvatar} className="items-center mb-6">
        <Image
          source={{ uri: avatarUri || avatar || 'default_avatar_uri' }}
          className="w-24 h-24 rounded-full"
        />
        <Text className="text-gray-400 mt-3">Change Avatar</Text>
      </TouchableOpacity> */}

      {/* Display Name Input */}
      <FormField
        title="Display Name"
        subtitle="(How other users will see you)"
        value={displayName}
        handleChangeText={(e) => setDisplayName(e)}
        otherStyles="mt-2"
      />

      {/* Password Input */}
      {/* <FormField
        title="Password"
        value={password}
        placeholder="Enter new password"
        secureTextEntry
        handleChangeText={(e) => setPassword(e)}
        otherStyles="mt-2"
      /> */}

      {/* Save Button */}
      <CustomButton
        title="Save Changes"
        handlePress={handleUpdateProfile}
        containerStyles="mt-7"
        isLoading={isSubmitting}
      />
    </SafeAreaView>
  );
};

export default EditProfile;
