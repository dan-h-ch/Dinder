import React, { Component } from 'react';
import { Text, Image, View, TouchableOpacity, Animated, PanResponder, AsyncStorage, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/styles.js';

var config = require('../../config.js');
var SWIPE_THRESHOLD = 96;

export default class Food extends Component {
  constructor (props) {
    super(props);
    this.state = {
      swipe: new Animated.ValueXY(),
      enter: new Animated.Value(0),
      cards: [],
      faved: false,
      loaded: false
    };
  }

  componentWillMount() {
    this.panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return gestureState.dx !== 0 && gestureState.dy !== 0;
      },
      onPanResponderGrant: (e, gestureState) => {
        this.state.swipe.setOffset({
          x: this.state.swipe.x._value,
          y: this.state.swipe.y._value
        });
        this.state.swipe.setValue({
          x: 0,
          y: 0
        });
      },
      onPanResponderMove: Animated.event([
        null,
        {
          dx: this.state.swipe.x,
          dy: this.state.swipe.y
        }
      ]),
      onPanResponderRelease: (e, {vx, vy}) => {
        this.state.swipe.flattenOffset();
        if (Math.abs(this.state.swipe.x._value) > SWIPE_THRESHOLD) {
          this.state.swipe.x._value > 0 ? this.judge('yes') : this.judge('no');
        } else {
          Animated.spring(this.state.swipe, {
            toValue: {
              x: 0,
              y: 0
            },
            friction: 3
          }).start();
        }
      }
    });
  }

  componentDidMount () {
    AsyncStorage.getItem('jwt')
    .then((token) => {
      this.setState({
        token: token
      }, this.getPhotos);
    }).done();
  }

  getPhotos () {
    navigator.geolocation.getCurrentPosition((position) => {
      let lat = position.coords.latitude;
      let long = position.coords.longitude;
      fetch(`${this.props.apiRoot}/api/photo/${lat}/${long}/food`, // fixme: dummy data
        {
          method: 'GET',
          headers: {
            authorization: this.state.token
          }
        }
      )
      .then((data) => data.json())
      .then((photos) => {
        this.setState({
          cards: photos,
          loaded: true
        });
        this.fadeIn();
      })
      .catch((err) => console.log(err));
    }, (error) => {
      alert('Please enable location services.');
    }, {
      enableHighAccurracy: true,
      timeout: 2000,
      maxinumAge: 1000
    });
  }

  popCard () {
    this.state.swipe.setValue({
      x: 0,
      y: 0
    });
    this.state.enter.setValue(0);
    this.setState({
      faved: false,
      cards: this.state.cards.length > 1 ? this.state.cards.slice(1) : []
    });
    this.fadeIn();
  }

  fadeIn () {
    Animated.spring(this.state.enter, {
      toValue: 1,
      delay: 250,
      tension: 20
    }).start();
  }

  judge (endpoint) {
    this.exchange(endpoint, this.state.cards[0].id);
    this.popCard();
  }

  fave () {
    let endpoint = this.state.faved ? 'unfavorite' : 'favorite';
    this.setState({
      faved: !this.state.faved
    });
    this.exchange(endpoint, this.state.cards[0].id);
  }

  exchange (endpoint, id) {
    fetch(`${this.props.apiRoot}/api/${endpoint}/${id}`,
      {
        method: 'POST',
        headers: {
          authorization: this.state.token
        }
      }
    )
    .catch((err) => console.log(err));
  }

  renderCard () {
    let pan = this.state.swipe;
    let [translateX, translateY] = [pan.x, pan.y];
    let rotate = pan.x.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: ['-30deg', '0deg', '30deg']
    });
    let scale = this.state.enter;
    let opacity = pan.x.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: [0, 1, 0]
    });
    let animatedCardstyles = {
      transform: [
        {translateX},
        {translateY},
        {rotate},
        {scale}
      ],
      opacity
    };

    let checkColor = 'hsl(130,100%,50%)';
    let crossColor = 'hsl(0,100%,50%)';
    let starColor = this.state.faved ? 'hsl(50,100%,50%)' : 'hsl(0,0%,50%)';
    let foodIcon = {
      textAlign: 'center'
    };
    let touchBar = {
      flexDirection: 'row',
      alignSelf: 'stretch',
      width: null,
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingTop: 10
    };
    return (
      <Animated.View style={[styles.foodCard, animatedCardstyles]} {...this.panResponder.panHandlers}>
        <TouchableOpacity onPress={ () => Linking.openURL('http://www.yelp.com/').catch(err => console.error('An error occurred', err)) }>
          <Image source={require('./assets/yelp-sm.png')} style={styles.yelpLogo} />
        </TouchableOpacity>
        <Image source={{uri: this.state.cards[0].url}} resizeMode="cover" style={{flex: 1, alignSelf: 'stretch', width: null, borderRadius: 3}} />
        <View style={touchBar}>
          <TouchableOpacity onPress={() => this.judge('no')}>
            <Icon style={foodIcon} name='times-circle' color={crossColor} size={50} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.fave()}>
            <Icon style={foodIcon} name='star' color={starColor} size={50} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.judge('yes')}>
            <Icon style={foodIcon} name='check-circle' color={checkColor} size={50} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  renderNoMore () {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Icon name='cutlery' style={{marginRight: 10}} size={40} color='hsl(0,0%,50%)'/>
        <View style={{flexDirection: 'column'}}>
          <Text>No More Cards!</Text>
          <Text>Try searching from a new location</Text>
          </View>
      </View>
    );
  }

  render () {
    let pan = this.state.swipe;
    let yupStyle = {
      opacity: pan.x.interpolate({
        inputRange: [0, 150],
        outputRange: [0, 1]
      })
    };
    let nopeStyle = {
      opacity: pan.x.interpolate({
        inputRange: [-150, 0],
        outputRange: [1, 0]
      })
    };
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Foods Near You</Text>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          {!this.state.loaded ? <Text>Loading...</Text>
            : (this.state.cards.length ? this.renderCard()
                : this.renderNoMore())}
        </View>
        <Animated.View style={[styles.yup, yupStyle]}>
          <Text style={styles.yupText}>Yum!</Text>
        </Animated.View>

        <Animated.View style={[styles.nope, nopeStyle]}>
          <Text style={styles.nopeText}>Meh.</Text>
        </Animated.View>
        {this.props.nav()}
      </View>
    );
  }
}