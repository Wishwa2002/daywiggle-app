import React, { useEffect } from "react";
import {
  PermissionsAndroid,
  Platform,
  Text,
} from "react-native";
import SmsAndroid from "react-native-get-sms-android";

export default function SmsReader() {

  useEffect(() => {
    readSMS();
  }, []);


  const requestSMSPermission = async () => {

    if (Platform.OS === "android") {

      const permission =
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS
        );

      return permission === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  };


  const readSMS = async () => {

    const granted = await requestSMSPermission();

    if (!granted) {
      console.log("SMS permission denied");
      return;
    }


    SmsAndroid.list(
      JSON.stringify({
        box: "inbox",
        maxCount: 50,
      }),

      (error) => {
        console.log("SMS Error:", error);
      },


      (count, smsList) => {

        const messages = JSON.parse(smsList);

        console.log("Total SMS:", count);


        messages.forEach((sms: any) => {

          console.log("---------------------");
          console.log("Sender:", sms.address);
          console.log("Message:", sms.body);

        });

      }
    );

  };


  return (
    <Text className="justify-center items-center m-4">
      SMS Reader Active
    </Text>
  );
}