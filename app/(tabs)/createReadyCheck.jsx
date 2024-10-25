import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormField, CustomButton } from "../../components";
import MultiSelect from "react-native-multiple-select";
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';

import { icons } from "../../constants";
import { createReadyCheck, getAllUsers } from "../../lib/appwrite";
import { formatTiming } from '../../utils/formatTiming';

const CreateReadyCheck = () => {
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    timing: "",
    activity: "",
    description: "",
    invitees: [],
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.map(user => ({ id: user.$id, name: user.name })));
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

    setSubmitting(true);

    try {
      await createReadyCheck({
        ...form, userId: user.$id
      });

      Alert.alert('Success', 'ReadyCheck sent');
      router.push('/home');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setForm({
        title: "",
        timing: "",
        activity: "",
        description: "",
        invitees: [],
      });

      setSubmitting(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm({
        ...form,
        timing: selectedDate.toISOString(),
      });
    }
  };

  const setToCurrentDateTime = () => {
    setShowDatePicker(false);
    const currentDate = new Date();
    setForm({
      ...form,
      timing: currentDate.toISOString(),
    });
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-secondary font-semibold pt-5">
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
          otherStyles="mt-10"
        />

        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <FormField
            title="Timing"
            value={form.timing ? formatTiming(form.timing) : ""}
            placeholder="Select date and time"
            editable={false}
            otherStyles="mt-3"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={setToCurrentDateTime} className="mt-2">
          <Text className="text-blue-500">Set to Right Now</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={form.timing ? new Date(form.timing) : new Date()}
            mode="datetime"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

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

        {/* Multi-Select for Invitees */}
        <Text className="text-lg text-secondary mt-3 mb-1">Invitees</Text>
        <MultiSelect
          items={users}
          uniqueKey="id"
          onSelectedItemsChange={(selectedItems) => setForm({ ...form, invitees: selectedItems })}
          selectedItems={form.invitees}
          selectText="Pick Invitees"
          searchInputPlaceholderText="Search Invitees..."
          tagRemoveIconColor="#CCC"
          tagBorderColor="#CCC"
          tagTextColor="#CCC"
          selectedItemTextColor="#CCC"
          selectedItemIconColor="#CCC"
          itemTextColor="#000"
          displayKey="name"
          searchInputStyle={{ color: '#CCC' }}
          submitButtonColor="#48d22b"
          submitButtonText="Select"
        />

        <View className="flex flex-row flex-wrap mt-3">
          {form.invitees.map(inviteeId => {
            const invitee = users.find(user => user.id === inviteeId);
            return (
              <View key={inviteeId} className="bg-gray-200 py-2 px-4 rounded-full m-1">
                <Text className="text-gray-700 text-sm">{invitee?.name}</Text>
              </View>
            );
          })}
        </View>

        <CustomButton
          title="Create"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={submitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateReadyCheck;