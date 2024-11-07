import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";

import { icons } from "../constants";

const FormField = ({ title, subtitle, value, placeholder, handleChangeText, placeholderTextColor = "#CDCDE0", otherStyles, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Conditional style for placeholder
    const inputStyle = value || isFocused
        ? "flex-1 text-white font-psemibold text-base"
        : "flex-1 text-gray-400 font-plight italic"; // Lighter font and italic for placeholder effect

    return (
        <View className={`my-2 ${otherStyles}`}>
            <Text className="mb-1 text-base text-gray-100 font-pmedium">{title}</Text>
            
            {/* Only render subtitle if it is provided */}
            {subtitle && (
                <Text className="mb-1 text-xs text-gray-400 font-plight">{subtitle}</Text>
            )}

            <View className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary items-center flex-row">
                <TextInput
                    className={inputStyle}
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderTextColor}
                    onChangeText={handleChangeText}
                    secureTextEntry={title === "Password" && !showPassword}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {title === "Password" && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Image source={!showPassword ? icons.eye : icons.eyeHide} className="w-6 h-6" resizeMode="contain" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default FormField;