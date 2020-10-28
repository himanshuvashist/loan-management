import React, { Component } from "react";
import RegistrationPage from "./RegistrationPage";
import LoginPage from "./LoginPage";
export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { OnRegistrationPage: true };
    this.handleRegistrationPageStatus = this.handleRegistrationPageStatus.bind(
      this
    );
  }

  handleRegistrationPageStatus() {
    this.setState({ OnRegistrationPage: !this.state.OnRegistrationPage });
  }
  render() {
    return this.state.OnRegistrationPage ? (
      <LoginPage
        toggleRegistrationPage={this.handleRegistrationPageStatus}
        {...this.props}
      />
    ) : (
      <RegistrationPage
        toggleRegistrationPage={this.handleRegistrationPageStatus}
        {...this.props}
      />
    );
  }
}
