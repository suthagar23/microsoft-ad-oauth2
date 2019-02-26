import React from 'react';
import { StyleSheet, Text, View, Button, AsyncStorage } from 'react-native';
import {ReactNativeAD, ADLoginView, Logger} from './azureAD/index.js'

const CLIENT_ID = ''
const KEY = ''

Logger.setLevel('VERBOSE')
export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      logout: false,
      logoutButtonVisible: false
    }
  }

  componentDidMount(){
    let lastLoginValue = AsyncStorage.getItem(KEY)
    lastLoginValue.then((value) => {
      console.log("lastLoginValue : ", value)
      if (value !== null) {
        this.setState({
          logout: false,
          logoutButtonVisible: true
        })
      }
    })

    this.setState(Object.assign({}, this.state, { logout: false}))
  }

  onLoginSuccess(credentials) {
    console.log(credentials)
    // use the access token ..
    this.setState({
      logout: false,
      logoutButtonVisible: true
    })
  }

  async onLogout() {
    console.log("Logout")
    await AsyncStorage.removeItem(KEY)
    this.setState({
      logout: true,
      logoutButtonVisible: false
    })
  }

  render() {
    new ReactNativeAD({
      client_id: CLIENT_ID,
      resources: [
        'https://graph.microsoft.com'
      ]})
    
    return (
      <View style={styles.container}>
        <Text>Welcome to Testing App</Text>
        <ADLoginView
              context={ReactNativeAD.getContext(CLIENT_ID)}
              onSuccess={this.onLoginSuccess.bind(this)}
              hideAfterLogin={true}
              needLogout={this.state.logout} />
      {this.state.logoutButtonVisible ? <Button title="Logout" onPress={this.onLogout.bind(this)} >  </Button> : null } 
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
