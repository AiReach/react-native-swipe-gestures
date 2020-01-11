"use strict";

import React, { Component } from "react";
import { View, PanResponder } from "react-native";

export const swipeDirections = {
  SWIPE_UP: "SWIPE_UP",
  SWIPE_DOWN: "SWIPE_DOWN",
  SWIPE_LEFT: "SWIPE_LEFT",
  SWIPE_RIGHT: "SWIPE_RIGHT"
};

const swipeConfig = {
  velocityThreshold: 0.3,
	minDistance: 40,
	maxOtherDistance: 40,
  detectSwipeUp: true,
  detectSwipeDown: true,
  detectSwipeLeft: true,
  detectSwipeRight: true
};

function isValidSwipe(
	velocity,
	minVelocity,
	distance,
	minDistance,
	otherDistance,
	maxOtherDistance
) {
	return (
		Math.abs(velocity) > minVelocity
		&& (!minDistance || Math.abs(distance) >= minDistance)
		&& (!maxOtherDistance || Math.abs(otherDistance) < Math.abs(distance))
	);
}

class GestureRecognizer extends Component {
  constructor(props, context) {
    super(props, context);
    console.warn(this.props.config)
    this.swipeConfig = Object.assign(swipeConfig, props.config);
  }

  componentWillReceiveProps(props) {
    this.swipeConfig = Object.assign(swipeConfig, props.config);
  }

  componentWillMount() {
    const responderEnd = this._handlePanResponderEnd.bind(this);
    const shouldSetResponder = this._handleShouldSetPanResponder.bind(this);
    this._panResponder = PanResponder.create({
      //stop JS beautify collapse
      onStartShouldSetPanResponder: shouldSetResponder,
      onMoveShouldSetPanResponder: shouldSetResponder,
      onPanResponderRelease: responderEnd,
      onPanResponderTerminate: responderEnd
    });
  }

  _handleShouldSetPanResponder(evt, gestureState) {
    const isValid = (
      evt.nativeEvent.touches.length === 1 &&
      !this._gestureIsClick(gestureState) &&
      this._validateSwipe(gestureState)
    );

    if (!isValid) return false;

    const {
      detectSwipeLeft,
      detectSwipeRight,
      detectSwipeUp,
      detectSwipeDown,
    } = this.swipeConfig;

    if (this._isValidHorizontalSwipe(gestureState) && ((detectSwipeLeft || detectSwipeRight))) {
      console.log("Horizontal.", detectSwipeLeft, detectSwipeRight);
      return true;
    }

    if (this._isValidVerticalSwipe(gestureState) && ((detectSwipeDown || detectSwipeUp))) {
      console.log("Vertical.", detectSwipeDown, detectSwipeUp);
      return true;
    }

    return false;
  }

  _validateSwipe(gestureState) {
    const {
      detectSwipeUp,
      detectSwipeDown,
      detectSwipeLeft,
      detectSwipeRight
    } = this.swipeConfig;
    const swipeDirection = this._getSwipeDirection(gestureState);
    const { SWIPE_LEFT, SWIPE_RIGHT, SWIPE_UP, SWIPE_DOWN } = swipeDirections;
    return (
      (detectSwipeUp && swipeDirection === SWIPE_UP) ||
      (detectSwipeDown && swipeDirection === SWIPE_DOWN) ||
      (detectSwipeLeft && swipeDirection === SWIPE_LEFT) ||
      (detectSwipeRight && swipeDirection === SWIPE_RIGHT)
    );
  }

  _gestureIsClick(gestureState) {
    return Math.abs(gestureState.dx) < 3 && Math.abs(gestureState.dy) < 3;
  }

  _handlePanResponderEnd(evt, gestureState) {
    const swipeDirection = this._getSwipeDirection(gestureState);
    this._triggerSwipeHandlers(swipeDirection, gestureState);
  }

  _triggerSwipeHandlers(swipeDirection, gestureState) {
    const {
      onSwipe,
      onSwipeUp,
      onSwipeDown,
      onSwipeLeft,
      onSwipeRight
    } = this.props;
    const { SWIPE_LEFT, SWIPE_RIGHT, SWIPE_UP, SWIPE_DOWN } = swipeDirections;
    onSwipe && onSwipe(swipeDirection, gestureState);
    switch (swipeDirection) {
      case SWIPE_LEFT:
        onSwipeLeft && onSwipeLeft(gestureState);
        break;
      case SWIPE_RIGHT:
        onSwipeRight && onSwipeRight(gestureState);
        break;
      case SWIPE_UP:
        onSwipeUp && onSwipeUp(gestureState);
        break;
      case SWIPE_DOWN:
        onSwipeDown && onSwipeDown(gestureState);
        break;
    }
  }

  _getSwipeDirection(gestureState) {
    const { SWIPE_LEFT, SWIPE_RIGHT, SWIPE_UP, SWIPE_DOWN } = swipeDirections;
    const { dx, dy } = gestureState;
    if (this._isValidHorizontalSwipe(gestureState)) {
      return dx > 0 ? SWIPE_RIGHT : SWIPE_LEFT;
    } else if (this._isValidVerticalSwipe(gestureState)) {
      return dy > 0 ? SWIPE_DOWN : SWIPE_UP;
    }
    return null;
  }

  _isValidHorizontalSwipe(gestureState) {
		const { vx, dx, dy } = gestureState;
		const { minVelocity, minDistance, maxOtherDistance } = this.swipeConfig;
		return isValidSwipe(vx, minVelocity, dx, minDistance, dy, maxOtherDistance);
  }

  _isValidVerticalSwipe(gestureState) {
		const { vy, dx, dy } = gestureState;
		const { minVelocity, minDistance, maxOtherDistance } = this.swipeConfig;
		return isValidSwipe(vy, minVelocity, dy, minDistance, dx, maxOtherDistance);
  }

  render() {
    return <View {...this.props} {...this._panResponder.panHandlers} />;
  }
}

export default GestureRecognizer;
