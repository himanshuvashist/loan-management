import React, { Component } from "react";
import { Button, Container, Tabs, Tab } from "react-bootstrap";
import LoanList from "./../loanlist/loanlist";
import LoanRequest from "./../loanrequest/loanRequest";
import UserList from "./userlist/userlist";
import jwt from "jsonwebtoken";
import axios from "axios";
export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = { key: "applications", id: "" };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    let config = {
      method: "post",
      url: `${window.location.protocol}//${window.location.hostname}:${process.env.REACT_APP_API_URL}/logout`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${this.props.token}`,
      },
      withCredentials: true,
    };
    axios(config)
      .then((res) => {
        if (res.status === 200) {
          this.props.stateUpdate(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
  componentDidMount() {
    const decoded = jwt.decode(this.props.token);
    console.log(decoded);
    this.setState({ id: decoded.id });
  }
  render() {
    return (
      <Container>
        <div>
          <br />
          <br />
          <h2>Dashboard</h2>
          <br />
          <br />

          <h6>UserId: {this.state.id}</h6>
          <br />
          <br />
          <div className="logout-button-div">
            <Button
              className="logout-button"
              variant="primary"
              onClick={this.handleClick}
            >
              Logout
            </Button>
          </div>

          <Tabs
            defaultActiveKey="applications"
            id="uncontrolled-tab-example"
            activeKey={this.state.key}
            onSelect={(k) => this.setState({ key: k })}
            unmountOnExit={true}
          >
            <Tab eventKey="applications" title="Applications">
              <LoanList token={this.props.token} />
            </Tab>
            {this.props.userType === "agent" ? (
              <Tab eventKey="apply" title="Apply">
                <LoanRequest token={this.props.token} />
              </Tab>
            ) : null}
            {this.props.userType === "admin" ||
            this.props.userType === "agent" ? (
              <Tab eventKey="users" title="Users">
                <UserList token={this.props.token} />
              </Tab>
            ) : null}
          </Tabs>
        </div>
      </Container>
    );
  }
}
