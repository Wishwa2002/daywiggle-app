import { Text, View } from 'react-native'
import React, { Component } from 'react'
import DateTimeDisplay from "../app/components/DateTimeDisplay";

export default class index extends Component {
  render() {
    const now=new Date();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = daysOfWeek[now.getDay()];
    return (
      <View>
        <Text>
          <DateTimeDisplay/>
        </Text>
      </View>
    )
  }
}