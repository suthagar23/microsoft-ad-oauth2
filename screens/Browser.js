import React from 'react';
import { StyleSheet, Text, View, Button} from 'react-native';
import { AuthSession } from 'expo';
import UserInfo from './UserInfo'
import {CONFIG} from '../azureAD/index'

import {_serialize} from '../azureAD/HelperFunctions'

export default class BrowserScreen extends React.Component {

    static navigationOptions = {
        header: null,
        title: "Browser"
      };


  constructor(props) {
    super(props)
    this.state = {
        userInfo: null,
        access_token: null
    }
  }

  _handlePressAsync = async () => {
    let redirectUrl = AuthSession.getRedirectUrl();
    
    let result = await AuthSession.startAsync({
      authUrl: CONFIG.authURL
    });

    if (result.type !== 'success') {
      alert('Uh oh, something went wrong');
      return;
    }

    if(result.params && result.params.error){
      alert(result.params.error);
      return;
    };
    let access_tokens = {}
    let code = result.params.code;

    for (let resource of CONFIG.resources) {
        let config = { 
            client_id : CONFIG.client_id, 
            redirect_uri: "exp://10.1.11.183:19000/--/expo-auth-session", 
            code, 
            client_secret:null,
            resource : resource
        }
        let grantType = "authorization_code"
        let body = `grant_type=${grantType}${_serialize(config)}`

        const defaultTokenUrl = 'https://login.microsoftonline.com/common/oauth2/token'
        let tockenInfoResponse = await fetch(
        defaultTokenUrl, {
            method : 'POST',
            mode : 'cors',
            headers : {
            'Content-Type' : 'application/x-www-form-urlencoded'
            },
            body
        }
        
        );
        const tokenInfo = await tockenInfoResponse.json();
        access_tokens[resource] = tokenInfo
    }
     let userInfoResponse = await fetch(
        `${CONFIG.graphURI}/v1.0/me/`, {
          method : 'GET',
          mode : 'cors',
          headers : {
            'Authorization': `Bearer ${access_tokens[CONFIG.graphURI].access_token}`,
            'Content-Type' : 'application/x-www-form-urlencoded'
          }
        }
      );

      let userInfo = await userInfoResponse.json()

      this.setState({
        ...this.state,
        userInfo: {
          name: userInfo.displayName,
          id: userInfo.id
        },
        access_tokens: access_tokens
      })
  };

  async _handleLogout(){

    let redirect =  AuthSession.getRedirectUrl();
    let result = await AuthSession.startAsync({
      authUrl: `${CONFIG.logoutURL}?post_logout_redirect_uri=${redirect}`
    })
    this.setState({
      ...this.state,
      userInfo: null,
      access_token: null
    })
  }

  render() {    
    return (
      <View style={styles.container}>

<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {!this.state.userInfo ? (
          <>
          <Button title="Open Browser to Login" onPress={this._handlePressAsync} />
          
          </>
        ) : (
          <>
          <UserInfo userInfo={this.state.userInfo} />          
          <Button title="Logout" onPress={this._handleLogout.bind(this)} />
          </>
        )}
      </View>
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


