import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { FormField, CustomButton } from "../../components";
import SelectFriends from "../../components/SelectFriends";
import { createReadyCheck, getAllUsers } from "../../lib/appwrite";

import { icons } from "../../constants";

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
    <SafeAreaView className="bg-primary h-[100vh]">
      <ScrollView className="flex-1 px-4 my-6">
        <Text className="text-2xl text-secondary font-psemibold pt-5">
          Create New ReadyCheck
        </Text>
        <FormField

          title="Title*"
          value={form.title}
          placeholder="Get people excited"
          handleChangeText={(e) => setForm({
            ...form,
            title: e,
          })}
          otherStyles="mt-4"
        />
        <FormField
          title="Timing*"
          value={form.timing}
          placeholder="When's this happening?"
          handleChangeText={(e) => setForm({
            ...form,
            timing: e,
          })}
          otherStyles="mt-3"
        />
        <FormField
          title="Activity"
          value={form.activity}
          placeholder="What are we doing?"
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
        <View className="space-y-2 mt-3">
          <Text className="text-base text-gray-100 font-pmedium">Invitees*</Text>

          <TouchableOpacity
            onPress={() => setShowInviteesModal(true)}
            className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl flex-row items-center"
          >
            <Text className="flex-1 text-gray-300 font-plight italic">
              {form.invitees.length ? `${form.invitees.length} Selected` : "Select Invitees"}
            </Text>
            <Image source={icons.chevronDown} className="w-5 h-5 text-gray-400" />
          </TouchableOpacity>
        </View>

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
    </SafeAreaView>
  );
};

export default CreateReadyCheck;