import React from 'react';
import { Linking, WebBrowser } from 'expo';
import { StyleSheet, Text, View, Button, AsyncStorage } from 'react-native';
import {ReactNativeAD, ADLoginView, Logger} from './azureAD/index.js'


const CONFIG = {
  client_id : 'b4739248-e8fb-4d15-8f47-c0eb173fec81',
  // redirectUrl : 'http://localhost:8080(optional)',
  // authorityHost : 'https://login.microsoftonline.com//oauth2/authorize',
  // tenant  : 'common(optional)',
  // client_secret : 'client-secret-of-your-app(optional)',
  resources : [
    'https://graph.microsoft.com',
    // 'https://outlook.office.com',
    // 'https://outlook.office365.com',
    // 'https://wiadvancetechnology.sharepoint.com',
    // 'https://graph.windows.net',
  ]
}


Logger.setLevel('VERBOSE')
export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      azureAdOauthActive: false,
      azureLoginPortalVisible: false,
      azureLogoutPortalVisible: false,
      showAzureError: false,
      azureErrorMessage: "",
      reactNativeAD: new ReactNativeAD(CONFIG)
    }
  }

  async componentDidMount(){
    for (let resource of CONFIG.resources){
      let credential = await this.state.reactNativeAD.checkCredential(resource)
      if(credential===null){
        await this.cleanTokens(CONFIG.resources);
        return;
      } else {
        let expires_on = credential.expires_on*1000
        if(Date.now() - expires_on > -60000) {
          await this.cleanTokens(CONFIG.resources)
          return;
        }
      }
    }
    this.setState(Object.assign({}, this.state, { azureAdOauthActive: true, azureLogoutPortalVisible: false}))
  }

  onLoginSuccess(credentials) {
    console.log(credentials)
    this.setState(Object.assign({}, this.state, { azureAdOauthActive: true, azureLoginPortalVisible: false}))
  }

  async cleanTokens(resources) {
    console.log("Clean Tokens")
    for (let resource of resources){
      let key = `${CONFIG.client_id}.${resource}`
      await AsyncStorage.removeItem(key)
    }
  }

  afterLogout(status) {
    this.setState(Object.assign({}, this.state, { azureAdOauthActive: false, azureLoginPortalVisible: false, azureLogoutPortalVisible:false}))
  }

  onLoginClick() {
    this.setState(Object.assign({}, this.state, { azureLoginPortalVisible: true}))
  }

  async onError(azureErrorMessage) {
    await this.cleanTokens(CONFIG.resources);
    this.setState(Object.assign({}, this.state, {
      azureAdOauthActive: false, 
      azureLoginPortalVisible: true, 
      azureLogoutPortalVisible:true,
      showAzureError:true,
      azureErrorMessage: azureErrorMessage
    }))
  }

  async onLogout() {
    console.log("Logout");
    await this.cleanTokens(CONFIG.resources);
    this.setState(Object.assign({}, this.state, { azureAdOauthActive: false, azureLoginPortalVisible:true, azureLogoutPortalVisible: true}));

  }

  render() {    
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
              context={ReactNativeAD.getContext(CONFIG.client_id)}
              onSuccess={this.onLoginSuccess.bind(this)}
              afterLogout={this.afterLogout.bind(this)}
              onError={(azureErrorMessage) => this.onError(azureErrorMessage)}
              hideAfterLogin={true}
              needLogout={this.state.azureLogoutPortalVisible} />
              :
              <>
                {this.state.showAzureError ? <Text>{this.state.azureErrorMessage}</Text>: null}
                <Button title="Login with Azure AD" onPress={this.onLoginClick.bind(this)}></Button>
              </>
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
