import React, { Component } from "react";
import { Container, Form, Button, Row,Alert } from "react-bootstrap";
import axios from "axios";

export default class RegistrationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      email: "",
      name: "",
      adminId:"",
      adminRegistration: false,
      successAlert:false,
    };
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleIdChange = this.handleIdChange.bind(this);
    this.handleUsertypeChange = this.handleUsertypeChange.bind(this);
    this.redirect = this.redirect.bind(this);
  }

  redirect(){
    setTimeout(() => {
      this.props.toggleRegistrationPage();
    }, 1000);
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log(event);
    let config = {
      method: "post",
      url: "http://localhost:3000/register",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        email: this.state.email,
        password: this.state.password,
        name: this.state.name,
        adminRegistration:this.state.adminRegistration,
        adminId:this.state.adminId,
      },
    };
    axios(config)
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          console.log("%cResult is ok", `color:green`);
          this.setState({successAlert:true})
          this.redirect()
        }
      })
      .catch((err) => {
        console.log(err);
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
  handleUsernameChange(e) {
    this.setState({ name: e.target.value });
    console.log(e.target.value);
  }
  handleIdChange(e) {
    this.setState({ adminId: e.target.value });
  }
  handleUsertypeChange(e) {
    console.log(e.target.value);
    if (e.target.value === "admin") {
      this.setState({ adminRegistration: true });
    } else {
      this.setState({ adminRegistration: false });
    }
  }
  handleRegister() {
    this.props.toggleRegistrationPage();
  }
  render() {
    return (
      <Container>
        <Row>
          <Form className="form" onSubmit={this.handleSubmit}>
            <Form.Group>
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Username"
                onChange={this.handleUsernameChange}
              />
            </Form.Group>
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
            <Form.Group controlId="exampleForm.ControlSelect1">
              <Form.Label>Registering As?</Form.Label>
              <Form.Control as="select" onChange={this.handleUsertypeChange}>
                <option value="customer">customer</option>
                <option value="admin">admin</option>
              </Form.Control>
            </Form.Group>
            {this.state.adminRegistration ? null : (
              <div>
                <Form.Group>
                  <Form.Label>admin id</Form.Label>
                  <Form.Control
                    placeholder="id"
                    onChange={this.handleIdChange}
                  ></Form.Control>
                </Form.Group>
              </div>
            )}

              {this.state.successAlert?<Alert variant="success">
    Registered successfully
  </Alert>:null}
            <Button variant="primary" type="submit">
              Submit
            </Button>
            <Button
              variant="secondary"
              className="register"
              onClick={this.handleRegister}
            >
              Login Instead
            </Button>
          </Form>
        </Row>
      </Container>
    );
  }
}
