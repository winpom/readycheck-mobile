import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, FlatList, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from '@react-native-community/datetimepicker';
import { getReadyCheck, updateReadyCheck, getAllUsers } from "../../../lib/appwrite";
import SelectFriends from "../../../components/SelectFriends";
import { formatTiming } from "../../../utils/formatTiming";

const EditReadyCheck = () => {
    const { readycheckId } = useLocalSearchParams();
    const [readycheck, setReadyCheck] = useState(null);
    const [users, setUsers] = useState([]);
    const [title, setTitle] = useState("");
    const [timing, setTiming] = useState("");
    const [description, setDescription] = useState("");
    const [invitees, setInvitees] = useState([]);
    const [isSelectingFriends, setIsSelectingFriends] = useState(false);
    const [showTimingModal, setShowTimingModal] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState(new Date());
    const router = useRouter();

    useEffect(() => {
        if (readycheckId) {
            getReadyCheck(readycheckId)
                .then((data) => {
                    setReadyCheck(data);
                    setTitle(data.title || "");
                    setTiming(data.timing || "");
                    setDescription(data.description || "");
                    setInvitees(data.invitees.map((invitee) => invitee.$id) || []);
                    setSelectedDateTime(new Date(data.timing || Date.now()));
                })
                .catch((error) => console.error("Failed to load ReadyCheck data:", error));
        }

        getAllUsers().then(setUsers).catch((error) => console.error("Failed to load users:", error));
    }, [readycheckId]);

    const handleSave = async () => {
        try {
            await updateReadyCheck(readycheckId, { title, timing, description, invitees });
            Alert.alert("Success", "ReadyCheck updated successfully.");
            router.push({
                pathname: `/readycheck/${readycheckId}`,
                params: { refresh: true },
            });
        } catch (error) {
            console.error("Failed to update ReadyCheck:", error);
            Alert.alert("Error", "Failed to update ReadyCheck.");
        }
    };

    const handleSelectTiming = () => {
        setTiming(selectedDateTime.toISOString());
        setShowTimingModal(false);
    };

    const handleCancel = () => {
        router.back();
    };

    const displayTiming = timing ? formatTiming(timing) : { date: '', time: '' };

    return (
        <SafeAreaView className="bg-primary h-full pt-5">
            <View className="px-4">
                <Text className="text-secondary text-3xl mt-2">Edit ReadyCheck</Text>
                <Text className="text-xs text-gray-100 font-pextralight">
                    *Required
                </Text>
                <View className="my-4">
                    <Text className="text-gray-100 text-lg">Title*</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter ReadyCheck title"
                        placeholderTextColor="#888"
                        className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl flex-row items-center text-gray-100"
                    />
                </View>

                <View className="mt-1">
                    <Text className="mb-1 text-base text-gray-100 font-pmedium">Timing*</Text>
                    <TouchableOpacity
                        onPress={() => setShowTimingModal(true)}
                        className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl flex-row items-center"
                    >
                        <Text className="flex-1 text-gray-300 font-plight italic">
                            {displayTiming.time && displayTiming.date ? `${displayTiming.time} on ${displayTiming.date}` : "Select date and time"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {showTimingModal && (
                    <Modal
                        transparent={true}
                        animationType="slide"
                        visible={showTimingModal}
                        onRequestClose={() => setShowTimingModal(false)}
                    >
                        <View className="flex-1 justify-center items-center bg-primary bg-opacity-75">
                            <TouchableOpacity onPress={() => setShowTimingModal(false)} className="p-2 mt-2 bg-gray-500 rounded w-[100px]">
                                <Text className="text-center text-white">Cancel</Text>
                            </TouchableOpacity>
                            <View className="bg-primary rounded-lg p-5 w-4/5">
                                <Text className="text-2xl text-gray-100 font-bold mb-4 text-center">Select Time and Date</Text>

                                <DateTimePicker
                                    value={selectedDateTime}
                                    mode="time"
                                    display="spinner"
                                    onChange={(event, date) => date && setSelectedDateTime(date)}
                                />
                                <DateTimePicker
                                    value={selectedDateTime}
                                    mode="date"
                                    display="spinner"
                                    onChange={(event, date) => date && setSelectedDateTime(date)}
                                    minimumDate={new Date()}
                                />

                                <View className="flex-row justify-between mt-4">
                                    <TouchableOpacity
                                        onPress={() => setTiming(new Date().toISOString())}
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

                <View className="my-4">
                    <Text className="mb-1 text-gray-100 text-lg">Description</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Enter description"
                        placeholderTextColor="#888"
                        className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl flex-row items-center text-gray-100"
                    />
                </View>

                <View className="space-y-1 mt-1">
                    <Text className="text-base text-gray-100 font-pmedium">Invitees*</Text>
                    <TouchableOpacity
                        onPress={() => setIsSelectingFriends(true)}
                        className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl flex-row items-center"
                    >
                        <Text className="flex-1 text-gray-300 font-plight italic">
                            {invitees.length ? `${invitees.length} Selected` : "Select Invitees"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="flex flex-row flex-wrap mt-3">
                    {invitees.map((inviteeId) => {
                        const invitee = users.find((user) => user.id === inviteeId);
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
                    selectedUsers={invitees}
                    setSelectedUsers={setInvitees}
                    visible={isSelectingFriends}
                    setVisible={setIsSelectingFriends}
                    initialSelectedUsers={invitees} // Ensure invitees are initially selected
                />

                <View className="flex-row justify-between mt-6">
                    <TouchableOpacity onPress={handleCancel} className="p-3 bg-gray-500 rounded">
                        <Text className="text-center text-white">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSave} className="p-3 bg-green-500 rounded">
                        <Text className="text-center text-white">Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default EditReadyCheck;
