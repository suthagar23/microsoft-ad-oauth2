import React from 'react';
import { Linking, WebBrowser } from 'expo';
import { StyleSheet, Text, View, Button, AsyncStorage } from 'react-native';
import {ReactNativeAD, ADLoginView, Logger} from './azureAD/index.js'

const CLIENT_ID = 'b4739248-e8fb-4d15-8f47-c0eb173fec81'
const KEY = 'b4739248-e8fb-4d15-8f47-c0eb173fec81.https://graph.microsoft.com'

Logger.setLevel('VERBOSE')
export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      azureAdOauthActive: false,
      azureLoginPortalVisible: false,
      azureLogoutPortalVisible: false,
      // logout: false,
      // logoutButtonVisible: false,
      // loginShow: false,
    }
  }

  componentDidMount(){
    let lastLoginValue = AsyncStorage.getItem(KEY)
    lastLoginValue.then((value) => {
      console.log("lastLoginValue : ", value)
      if (value !== null) {
        this.setState(Object.assign({}, this.state, { azureAdOauthActive: true, azureLogoutPortalVisible: false}))
      }
    })
  }

  onLoginSuccess(credentials) {
    console.log(credentials)
    this.setState(Object.assign({}, this.state, { azureAdOauthActive: true, azureLoginPortalVisible: false}))
  }

  afterLogout(status) {
    this.setState(Object.assign({}, this.state, { azureAdOauthActive: false, azureLoginPortalVisible: false, azureLogoutPortalVisible:false}))
  }

  onLoginClick() {
    this.setState(Object.assign({}, this.state, { azureLoginPortalVisible: true}))
  }

  async onLogout() {
    console.log("Logout")
    await AsyncStorage.removeItem(KEY)
    this.setState(Object.assign({}, this.state, { azureAdOauthActive: false, azureLoginPortalVisible:true, azureLogoutPortalVisible: true}))

  }

  render() {
    new ReactNativeAD({
      client_id: CLIENT_ID,
      resources: [
        'https://graph.microsoft.com'
      ]})
    
    return (
      <View style={styles.container}>
        {this.state.azureAdOauthActive ? 
          <View>
          <Text>Welcome to Testing App</Text>
          <Button title="Logout" onPress={this.onLogout.bind(this)} >  </Button>
          </View>
          : 

          <View>
            {this.state.azureLoginPortalVisible ? 
              <ADLoginView
              context={ReactNativeAD.getContext(CLIENT_ID)}
              onSuccess={this.onLoginSuccess.bind(this)}
              afterLogout={this.afterLogout.bind(this)}
              hideAfterLogin={true}
              needLogout={this.state.azureLogoutPortalVisible} />
              :
              <Button title="Login with Azure AD" onPress={this.onLoginClick.bind(this)}></Button>
            }
          </View>
          
        } 
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
