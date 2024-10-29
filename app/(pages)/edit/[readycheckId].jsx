import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getReadyCheck, updateReadyCheck } from "../../../lib/appwrite";
import UserCard from "../../../components/UserCard";
import SelectFriends from "../../../components/SelectFriends";

const EditReadyCheck = () => {
    const { readycheckId } = useLocalSearchParams();
    const [readycheck, setReadyCheck] = useState(null);
    const [title, setTitle] = useState("");
    const [timing, setTiming] = useState("");
    const [description, setDescription] = useState("");
    const [invitees, setInvitees] = useState([]);
    const [isSelectingFriends, setIsSelectingFriends] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (readycheckId) {
            getReadyCheck(readycheckId)
                .then((data) => {
                    setReadyCheck(data);
                    setTitle(data.title || "");
                    setTiming(data.timing || "");
                    setDescription(data.description || "");
                    setInvitees(data.invitees || []);
                })
                .catch((error) => console.error("Failed to load ReadyCheck data:", error));
        }
    }, [readycheckId]);

    const handleSave = async () => {
        try {
            await updateReadyCheck(readycheckId, { title, timing, description, invitees });
            Alert.alert("Success", "ReadyCheck updated successfully.");
            router.back(); // Navigate back to the ReadyCheck page after saving
        } catch (error) {
            console.error("Failed to update ReadyCheck:", error);
            Alert.alert("Error", "Failed to update ReadyCheck.");
        }
    };

    const handleCancel = () => {
        router.back();
    };

    if (!readycheck) return null;

    return (
        <SafeAreaView className="bg-primary h-full pt-5">
            <View className="px-4">
                <Text className="text-secondary text-3xl my-2 text-center">Edit ReadyCheck</Text>
                <View className="my-4">
                    <Text className="text-white text-lg">Title:</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter ReadyCheck title"
                        placeholderTextColor="#888"
                        className="bg-gray-700 text-white p-3 rounded"
                    />
                </View>
                <View className="my-4">
                    <Text className="text-white text-lg">Timing:</Text>
                    <TextInput
                        value={timing}
                        onChangeText={setTiming}
                        placeholder="YYYY-MM-DDTHH:MM:SS"
                        placeholderTextColor="#888"
                        className="bg-gray-700 text-white p-3 rounded"
                    />
                </View>
                <View className="my-4">
                    <Text className="text-white text-lg">Description:</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Enter description"
                        placeholderTextColor="#888"
                        className="bg-gray-700 text-white p-3 rounded"
                    />
                </View>
                <View className="my-4">
                    <Text className="text-white text-lg">Invitees:</Text>
                    <FlatList
                        data={invitees}
                        keyExtractor={(item) => item.id || item.$id}
                        renderItem={({ item }) => <UserCard user={item} />}
                        ListEmptyComponent={() => (
                            <Text className="text-gray-400 text-center">No Invitees Added</Text>
                        )}
                    />
                    <TouchableOpacity
                        onPress={() => setIsSelectingFriends(true)}
                        className="mt-3 p-3 bg-blue-500 rounded"
                    >
                        <Text className="text-center text-white">Add/Remove Invitees</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between mt-6">
                    <TouchableOpacity onPress={handleCancel} className="p-3 bg-gray-500 rounded">
                        <Text className="text-center text-white">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSave} className="p-3 bg-green-500 rounded">
                        <Text className="text-center text-white">Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <SelectFriends
                visible={isSelectingFriends}
                selectedUsers={invitees.map((invitee) => invitee.$id)}
                setSelectedUsers={(updatedInvitees) => {
                    setInvitees(updatedInvitees);
                    setIsSelectingFriends(false);
                }}
                setVisible={setIsSelectingFriends}
            />
        </SafeAreaView>
    );
};

export default EditReadyCheck;
