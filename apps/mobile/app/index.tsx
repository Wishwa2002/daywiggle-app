import { ScrollView,Text, View } from 'react-native'
import React, { Component } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimeDisplay from "../app/components/DateTimeDisplay";

export default class index extends Component {
  render() {
    return (
         <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-10"
          >


            <DateTimeDisplay />
            
          </ScrollView>
        </SafeAreaView>
    )
  }
}