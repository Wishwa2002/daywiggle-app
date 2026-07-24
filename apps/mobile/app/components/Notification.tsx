import React,{Component} from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export class Notification extends Component {
  render() {
    return (
      <View>
        <TouchableOpacity className="h-11 w-11 items-center justify-center rounded-full bg-gray-100">
          <Ionicons 
            name="notifications-outline" 
            size={24} 
            color="black" 
          />
        </TouchableOpacity>
      </View>
    )
  }
}

export default Notification
