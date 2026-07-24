import React from "react";
import { View,SafeAreaViewBase} from "react-native";
import DateTimeDisplay from "./components/DateTimeDisplay";
import Profile from './components/Profile'
import Notification from './components/Notification'
import SmsReader from './components/SmsReader'

export default function HomeScreen() {
  return (

    
    <View className="flex-1 bg-white">
      <View>
        <View className="flex-row items-center justify-between px-3 py-5">
          <DateTimeDisplay/>
          <View className="flex-row items-center gap-4">
            <Notification />
            <Profile />
          </View>
          
        </View>
        <SmsReader/>
        
        
        
      </View>
      
      
    </View>
  );
}