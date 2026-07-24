import React,{Component} from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export class Profile extends Component {
  render() {
    return (
      <View>
        <TouchableOpacity>
          <Image
            source={require("../../assets/images/profile.jpg")}

            className="h-12 w-12 rounded-full"
          />
        </TouchableOpacity>
      </View>
    )
  }
}

export default Profile
