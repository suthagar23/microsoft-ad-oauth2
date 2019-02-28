import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppNavigator from './navigation/AppNavigator'
export default class App extends React.Component {

  static navigationOptions = {
    header: null,
  };


  constructor(props) {
    super(props)
  }

  render() {    
    return (
      <View style={styles.container}>
        <AppNavigator />
      </View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});