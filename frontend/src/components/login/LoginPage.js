import React, { Component } from "react";
import { Container, Form, Button, Row ,Alert} from "react-bootstrap";
import axios from "axios";

export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = { password: "", email: "", alert: false };
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log(`${window.location.protocol}//${window.location.hostname}:${process.env.REACT_APP_API_URL}/login`)
    let config = {
      method: "post",
      url: `${window.location.protocol}//${window.location.hostname}:${process.env.REACT_APP_API_URL}/login`,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      data: { email: this.state.email, password: this.state.password },
    };
    axios(config)
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          if (res.data.loggedin) {
            this.props.updateToken(res.data.accessToken)
            this.props.updateUserType(res.data.userType)
            this.props.stateUpdate(true);
          } else {
            this.setState({ alert: true });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        if(err.hasOwnProperty('response') && err.response.status === 404){
          this.setState({alert:true})
        }
      });
  }
  handleEmailChange(e) {
    this.setState({ email: e.target.value });
    console.log(e.target.value);
  }
  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
    console.log(e.target.value);
  }
  handleRegister() {
    this.props.toggleRegistrationPage();
  }
  render() {
    return (
      <Container>
        <Row>
          <Form className="form" onSubmit={this.handleSubmit}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                autoComplete="off"
                onChange={this.handleEmailChange}
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                onChange={this.handlePasswordChange}
              />
            </Form.Group>
            {this.state.alert?<Alert variant="warning">
              Incorrect Info, please retry!
            </Alert>:null}
            
            <Button variant="primary" type="submit">
              Submit
            </Button>
            <Button
              variant="secondary"
              className="register"
              onClick={this.handleRegister}
            >
              Register first
            </Button>
          </Form>
        </Row>
      </Container>
    );
  }
}
