import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Modal } from "react-native";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import DateTimePicker from '@react-native-community/datetimepicker';

import { FormField, CustomButton } from "../../components";
import SelectFriends from "../../components/SelectFriends";
import { createReadyCheck, getAllUsers } from "../../lib/appwrite";
import { formatTiming } from "../../utils/formatTiming";
import { useGlobalContext } from '../../context/GlobalProvider';

import { icons } from "../../constants";

const CreateReadyCheck = () => {
  const [uploading, setUploading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showInviteesModal, setShowInviteesModal] = useState(false);
  const [showTimingModal, setShowTimingModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());

  const { user, isLoading } = useGlobalContext();

  const [form, setForm] = useState({
    title: "",
    timing: "",
    description: "",
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

  const handleSelectTiming = () => {
    const isoDatetime = selectedDateTime.toISOString();
    setForm({
      ...form,
      timing: isoDatetime,
    });
    setShowTimingModal(false);
  };

  const setToCurrentDateTime = () => {
    const currentDate = new Date();
    setForm({
      ...form,
      timing: currentDate.toISOString(),
    });
    setShowTimingModal(false);
  };

  const submit = async () => {
    if (isLoading || !user) {
      return Alert.alert("Loading user data, please wait...");
    }

    if (!form.title || !form.timing || !form.invitees.length) {
      return Alert.alert("Please fill out all required fields");
    }

    setUploading(true);

    try {
      // Assign `owner` to the current user's ID
      await createReadyCheck({
        ...form,
        owner: user.$id,
      });

      Alert.alert('Success', 'ReadyCheck sent');
      // router.push('/home');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setForm({ title: "", timing: "", description: "", invitees: [] });
      setUploading(false);
    }
  };

  const displayTiming = form.timing ? formatTiming(form.timing) : { date: '', time: '' };

  return (
    <SafeAreaView className="bg-primary h-[100vh]">
      <StatusBar backgroundColor="#161622" style="light" />
      <ScrollView className="flex-1 px-4 my-6">
        <Text className="text-2xl text-secondary font-psemibold pt-5">
          Create New ReadyCheck
        </Text>
        <Text className="text-xs text-gray-100 font-pextralight">
          *Required
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

        {/* Timing Field */}
        <View className="mt-3">
          <Text className="text-base text-gray-100 font-pmedium">Timing*</Text>
          <TouchableOpacity
            onPress={() => setShowTimingModal(true)}
            className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl flex-row items-center"
          >
            <Text className="flex-1 text-gray-300 font-plight italic">
              {displayTiming.time && displayTiming.date ? `${displayTiming.time} on ${displayTiming.date}` : "Select date and time"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Timing Modal */}
        {showTimingModal && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showTimingModal}
            onRequestClose={() => setShowTimingModal(false)}
          >
            <View className="flex-1 justify-center items-center bg-primary bg-opacity-75">
              <View className="bg-primary rounded-lg p-5 w-4/5">
                <Text className="text-2xl text-gray-100 font-bold mb-4 text-center">Select Time and Date</Text>

                {/* Time Picker with spinner style */}
                <DateTimePicker
                  value={selectedDateTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, date) => date && setSelectedDateTime(date)}
                />

                {/* Date Picker with spinner style */}
                <DateTimePicker
                  value={selectedDateTime}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => date && setSelectedDateTime(date)}
                  minimumDate={new Date()}
                />

                {/* Modal Buttons */}
                <View className="flex-row justify-between mt-4">
                  <TouchableOpacity
                    onPress={setToCurrentDateTime}
                    className="p-2 bg-blue-500 rounded w-[48%]"
                  >
                    <Text className="text-center text-white">Set to Right Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSelectTiming}
                    className="p-2 bg-green-500 rounded w-[48%]"
                  >
                    <Text className="text-center text-white">Select</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

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
