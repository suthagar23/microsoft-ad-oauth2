import React from 'react';
import { StyleSheet, Text, View, Button, AsyncStorage } from 'react-native';
import {ReactNativeAD, ADLoginView, Logger} from '../azureAD/index'
import UserInfo from './UserInfo'


const CONFIG = {
  client_id : '02f47253-560c-477b-994d-fe0692792f86',
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

export default class WebViewScreen extends React.Component {

    static navigationOptions = {
        header: null,
        title: "Browser"
      };

  constructor(props) {
    super(props)
    this.state = {
      azureAdOauthActive: false,
      azureLoginPortalVisible: false,
      azureLogoutPortalVisible: false,
      showAzureError: false,
      visible: false,
      azureErrorMessage: "",
      reactNativeAD: new ReactNativeAD(CONFIG),
      userInfo: null
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

  async onLoginSuccess(credentials) {

    let key = `${CONFIG.client_id}.${CONFIG.resources[0]}`
    let accessTokenString = await AsyncStorage.getItem(key)
    let accessTokenJson = JSON.parse(accessTokenString)
    let userInfoResponse = await fetch(
        "https://graph.microsoft.com/v1.0/me/", {
          method : 'GET',
          mode : 'cors',
          headers : {
            'Authorization': `Bearer ${accessTokenJson.access_token}`,
            'Content-Type' : 'application/x-www-form-urlencoded'
          }
        }
      );

      let userInfo = await userInfoResponse.json()
      console.log(userInfo)
      this.setState({
        ...this.state,
        userInfo: {
          name: userInfo.displayName,
          id: userInfo.id
        },
      })
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
    this.setState(Object.assign({}, this.state, { azureLoginPortalVisible: true, visible: true}))
  }

  async onError(azureErrorMessage) {
    
    let token;
    for (let resource of CONFIG.resources) {
      let key = `${CONFIG.client_id}.${resource}`
      token = await AsyncStorage.getItem(key)
      if(token !== null){
        break
      }
    }
    
    if(token){
      await this.cleanTokens(CONFIG.resources);
      this.setState(Object.assign({}, this.state, {
        azureAdOauthActive: false, 
        access_token: null,
        azureLoginPortalVisible: true, 
        azureLogoutPortalVisible:true,
        showAzureError:true,
        azureErrorMessage: azureErrorMessage
      }))
    } else {
      this.setState(Object.assign({}, this.state, {
        azureAdOauthActive: false, 
        access_token: null,
        azureLoginPortalVisible: false, 
        azureLogoutPortalVisible:false,
        showAzureError:true,
        azureErrorMessage: azureErrorMessage
      }))
    }
  }

  async onLogout() {
    console.log("Logout");
    await this.cleanTokens(CONFIG.resources);
    this.setState(Object.assign({}, this.state, { azureAdOauthActive: false, azureLoginPortalVisible:true, azureLogoutPortalVisible: true}));

  }



  handleModalOnRequestClose(){
    this.setState({
      ...this.state,
      visible: !this.state.visible
    })
    this.afterLogout()
  }

  render() {   
    return (
        <View style={styles.container}>
        {this.state.azureAdOauthActive ? 
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Welcome to Testing App</Text>
          {this.state.userInfo ? 
           <>
           <UserInfo userInfo={this.state.userInfo} />
           </> : null
          }

          <Button title="Logout" onPress={this.onLogout.bind(this)} >  </Button>
          </View>
          : 
          <>
            {this.state.azureLoginPortalVisible ?
              <ADLoginView
              context={ReactNativeAD.getContext(CONFIG.client_id)}
              onSuccess={this.onLoginSuccess.bind(this)}
              afterLogout={this.afterLogout.bind(this)}
              onError={(azureErrorMessage) => this.onError(azureErrorMessage)}
              hideAfterLogin={true}
              handleModalOnRequestClose={() => this.handleModalOnRequestClose()}
              needLogout={this.state.azureLogoutPortalVisible} />
              :
              <>
                {this.state.showAzureError ? <Text>{this.state.azureErrorMessage}</Text>: null}
                <Button title="Login with Azure AD" onPress={this.onLoginClick.bind(this)}></Button>
              </>
            }
          </> 
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