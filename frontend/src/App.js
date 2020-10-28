import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import "./App.css";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      userType: "customer",
      accessToken: "",
    };
    this.handleStateUpdate = this.handleStateUpdate.bind(this);
    this.updateUserType = this.updateUserType.bind(this);
    this.updateToken = this.updateToken.bind(this);
  }
  handleStateUpdate(updatedValue) {
    this.setState({ isAuthenticated: updatedValue }, () => {
      if (!this.state.isAuthenticated) {
        this.setState({ userType: "", accessToken: "" });
      }
    });
    console.log(`state has been updated`);
  }
  updateUserType(updatedValue) {
    this.setState({ userType: updatedValue });
    console.log("userType has been updated");
  }
  updateToken(updatedValue) {
    this.setState({ accessToken: updatedValue });
    console.log("token has been updated");
  }
  render() {
    return (
      <div>
        {this.state.isAuthenticated ? (
          <Dashboard
            stateUpdate={this.handleStateUpdate}
            userType={this.state.userType}
            token={this.state.accessToken}
          />
        ) : (
          <Login
            stateUpdate={this.handleStateUpdate}
            updateUserType={this.updateUserType}
            updateToken={this.updateToken}
          />
        )}
      </div>
    );
  }
}
