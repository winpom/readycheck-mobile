import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { FormField, CustomButton } from "../../components";
import SelectFriends from "../../components/SelectFriends";
import { createReadyCheck, getAllUsers } from "../../lib/appwrite";

const CreateReadyCheck = () => {
  const [uploading, setUploading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showInviteesModal, setShowInviteesModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    timing: "",
    activity: "",
    description: "",
    owner: "",
    invitees: [],
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response);
      } catch (error) {
        Alert.alert("Error", "Could not load users.");
      }
    };
    fetchUsers();
  }, []);

  const submit = async () => {
    if (!form.title || !form.timing || !form.activity || !form.invitees.length) {
      return Alert.alert("Please fill out all required fields");
    }

    setUploading(true);

    try {
      await createReadyCheck({ ...form, userId: user.$id });
      Alert.alert('Success', 'ReadyCheck sent');
      router.push('/home');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setForm({ title: "", timing: "", activity: "", description: "", invitees: [] });
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="white px-4 my-6">
        <Text className="text-2xl text-secondary font-psemibold pt-5">
          Create New ReadyCheck
        </Text>
        <FormField

          title="Title"
          value={form.title}
          placeholder="Let people know what's up..."
          handleChangeText={(e) => setForm({
            ...form,
            title: e,
          })}
          otherStyles="mt-7"
        />
        <FormField
          title="Timing"
          value={form.timing}
          placeholder="Let people know what's up..."
          handleChangeText={(e) => setForm({
            ...form,
            timing: e,
          })}
          otherStyles="mt-3"
        />
        <FormField
          title="Activity"
          value={form.activity}
          placeholder="Let people know what's up..."
          handleChangeText={(e) => setForm({
            ...form,
            activity: e,
          })}
          otherStyles="mt-3"
        />
        <FormField
          title="Description"
          value={form.description}
          placeholder="Let people know what's up..."
          handleChangeText={(e) => setForm({
            ...form,
            description: e,
          })}
          otherStyles="mt-3"
        />
         {/* Invitees Selection */}
         <Text className="text-lg text-gray-100 mt-3 font-regular">Invitees</Text>
        <TouchableOpacity
          onPress={() => setShowInviteesModal(true)}
          className="border-2 border-gray-300 rounded-lg bg-gray-100 p-4 mt-2"
        >
          <Text className="text-gray-700">{form.invitees.length ? "Edit Invitees" : "Select Invitees"}</Text>
        </TouchableOpacity>

        {/* Display Selected Invitees as Avatars */}
        <View className="flex flex-row flex-wrap mt-3">
          {form.invitees.map(inviteeId => {
            const invitee = users.find(user => user.id === inviteeId);
            return (
              <View key={inviteeId} className="m-1">
                {invitee?.avatarUrl ? (
                  <Image
                    source={{ uri: invitee.avatarUrl }}
                    className="w-10 h-10 rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <Text className="text-gray-600">{invitee?.name[0]}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <SelectFriends
          selectedUsers={form.invitees}
          setSelectedUsers={(selectedUsers) => setForm({ ...form, invitees: selectedUsers })}
          visible={showInviteesModal}
          setVisible={setShowInviteesModal}
        />
        <CustomButton title="Create" handlePress={submit} containerStyles="mt-7" isLoading={uploading} />
      </ScrollView>
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
};

export default CreateReadyCheck;