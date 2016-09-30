// import React, { Component, View, Text, StyleSheet } from 'react-native';

import React, { Component } from 'react';
import { Icon, Button, Navigator} from 'react-native-elements';
import { Text, View, AsyncStorage, TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';

import index from '../index';
import styles from '../styles/styles.js';
import config from '../../config.js';
import SignUp from './SignUp';

export default class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      error: '',
    };
  }

  userSignIn() {
    return fetch(`${this.props.apiRoot}signin`, {
      method: 'POST', 
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email: this.state.email, 
        password: this.state.password
      })
    })
    .then((response) => response.json())
    .then((res) => {
      if (!res.error) {
        AsyncStorage.setItem('jwt', res.token);
        console.log('signin jwt', res.token);
        Actions.tabbar();
      }
    })
    .catch((error) => {
      console.log(error);
      this.setState({error: 'Sign In Error!'});
    })
    .done();
  }

  render() {
    return (
      <View style={styles.container}>

        <Text style={styles.welcome}>
          Welcome to Dinder!
        </Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>email:</Text>
          <TextInput
            placeholder='user@dinderdore.com'
            autoCorrect={false}
            autoCapitalize='none'
            style={styles.textInputBox} 
            value={this.state.email}
            onChangeText={email => this.setState({ email })}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>password:</Text>
          <TextInput
            placeholder="password"
            secureTextEntry={true}
            autoCorrect={false}
            style={styles.textInputBox} 
            value={this.state.password}
            onChangeText={password => this.setState({ password })}
          />
          </View>

          <View>
          <Button 
            onPress={this.userSignIn.bind(this)}
            buttonStyle={styles.buttonBlue}
            title='Sign In'
          /></View>
          <Text style={styles.errorTextStyle}>{this.state.error}</Text>
          <Text onPress={Actions.signup}>Don't have an account? Sign up here!</Text>
      </View>
    );
  }
}