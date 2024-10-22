import { View, Text, Image } from 'react-native';
import React from 'react';

import { icons } from '../constants';

const UserCard = ({ user }) => {
    const {
        username = 'Anonymous', 
        avatar = icons.defaultAvatar // Default avatar if none provided
    } = user || {}; // Fallback to an empty object if user is undefined

    return (
        <View className="flex-col items-center px-4 mb-14">
            <View className="flex-row gap-3 items-start">
                <View className="justify-center items-center flex-row flex-1">
                    <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
                        <Image
                            source={{ uri: avatar }}
                            className="w-full h-full rounded-lg"
                            resizeMode="cover"
                        />
                    </View>
                    <View className="justify-center flex-w ml-3 gap-y-1">
                        <Text className="text-xs text-gray-100 font-pregular" numberOfLines={1}>
                            {username}
                        </Text>
                    </View>
                </View>
                <View className="pt-2">
                    <Image
                        source={icons.menu}
                        className="w-5 h-5"
                        resizeMode="contain"
                    />
                </View>
            </View>
        </View>
    );
}

export default UserCard;
