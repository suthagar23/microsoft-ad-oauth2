import { Linking, WebBrowser, AuthSession } from 'expo';
import UserInfo from './UserInfo'
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import CONFIG from '../azureAD/Config'
import {_serialize} from '../azureAD/HelperFunctions'

import qs from 'qs';

const BASE_URL = `https://auth.expo.io`;

export default class BrowserWithoutAuthScreen extends React.Component {
  state = {
    redirectData: null,
  };

  componentDidUpdate(){
      // console.log(this.state)
  }

  render() {
    return (
      <View style={styles.container}>
{ !this.state.userInfo ? 
        <Button
          onPress={this._openWebBrowserAsync}
          title="Login"
        />
        :
        <>
        <UserInfo userInfo={this.state.userInfo} />
        <Button onPress={() => this._handleLogout()} title="Logout" />
        </>
}
      </View>
    );
  }

   _handleRedirect = async (event) => {
        console.log(event)
        WebBrowser.dismissBrowser();

        let data = Linking.parse(event.url);

        if(data.queryParams && data.queryParams.code){
    // this.setState({ code: data });
    await this._grantAccessTocken(data.queryParams.code)
        }
  };

  async _grantAccessTocken(code){
    let access_tokens = {}
    // let code = result.params.code;

    for (let resource of CONFIG.resources) {
        let config = {
            client_id : CONFIG.client_id, 
            redirect_uri: "exp://127.0.0.1:19000/--/expo-auth-session", 
            code: code, 
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
  }

  _openWebBrowserAsync = async () => {
    try {
      await this._addLinkingListener();
      let result = await WebBrowser.openBrowserAsync(
        CONFIG.authURL
      );
      await this._removeLinkingListener();
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  async _handleLogout() {

    let redirect =  'exp://127.0.0.1:19000/--/expo-auth-session'
    const authUrl = `${CONFIG.logoutURL}?post_logout_redirect_uri=${redirect}`;
    this.setState({
      ...this.state,
      userInfo: null,
      access_token: null
    })
    await this._addLinkingListener();
    let result = await WebBrowser.openAuthSessionAsync(authUrl, redirect);
    await this._removeLinkingListener();

    // console.log(result);
  }

  _addLinkingListener = async () => {
    await Linking.addEventListener('url', this._handleRedirect);
  };

  _removeLinkingListener = async () => {
    await Linking.removeEventListener('url', this._handleRedirect);
  };

  _maybeRenderRedirectData = () => {
    if (!this.state.redirectData) {
      return;
    }

    return <Text>{JSON.stringify(this.state.redirectData)}</Text>;
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  header: {
    fontSize: 25,
    marginBottom: 25,
  },
});



function getDefaultReturnUrl(): string {
  return Linking.makeUrl('expo-auth-session');
}
