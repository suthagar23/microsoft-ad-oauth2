import { Text, View} from 'react-native';
import React from 'react'

const UserInfo = ({userInfo}) => {
    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 20 }}>{userInfo.name}</Text>
        <Text>ID: {userInfo.id}</Text>
      </View>
    );
  };

  export default UserInfo;