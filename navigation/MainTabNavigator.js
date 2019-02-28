import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import BrowserScreen from '../screens/Browser';
import WebViewScreen from '../screens/WebView';


const BrowserStack = createStackNavigator({
  Browser: BrowserScreen,
});

BrowserStack.navigationOptions = {
  tabBarLabel: 'Browser',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};


const WebViewStack = createStackNavigator({
  WebView: WebViewScreen,
});

WebViewStack.navigationOptions = {
  tabBarLabel: 'WebView',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

export default createBottomTabNavigator({
  BrowserStack,
  WebViewStack
});
