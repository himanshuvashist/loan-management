import React, { Component } from "react";
import { Form, Button, Col, Row, Alert } from "react-bootstrap";
import axios from "axios";
import jwt from "jsonwebtoken";

export default class loanRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitted_by: "",
      on_behalf: "",
      tenure: 0,
      amount: 0,
      submitted: false,
      showError: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleAmountChange = this.handleAmountChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleTenureChange = this.handleTenureChange.bind(this);
    this.clearInputs = this.clearInputs.bind(this);
  }
  componentDidMount() {
    console.log(jwt.decode(this.props.token));
  }
  handleSubmit(e) {
    e.preventDefault();
    let config = {
      method: "post",
      url: `${process.env.REACT_APP_API_URL}/submit`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${this.props.token}`,
      },
      withCredentials: true,
      data: {
        on_behalf: this.state.on_behalf,
        tenure: this.state.tenure,
        amount: this.state.amount,
      },
    };
    axios(config)
      .then((res) => {
        if (res.status === 200) {
          console.log(res);
          this.setState({ submitted: true });
          setTimeout(() => {
            this.setState({ submitted: false });
          }, 3000);
          this.clearInputs();
          this.setState({ on_behalf: "", tenure: 0, amount: 0 });
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({ showError: true });
        setTimeout(() => {
          this.setState({ showErro: false });
        }, 3000);
      });
  }
  clearInputs() {
    this.setState({ on_behalf: "", tenure: 0, amount: 0 });
  }
  handleAmountChange(e) {
    console.log(e.target.value);
    this.setState({ amount: e.target.value });
  }
  handleTenureChange(e) {
    console.log(e.target.value);
    this.setState({ tenure: e.target.value });
  }
  handleEmailChange(e) {
    console.log(e.target.value);
    this.setState({ on_behalf: e.target.value });
  }
  render() {
    return (
      <div>
        <Form>
          <Form.Group controlId="formBasicPassword">
            <Form.Label>Applicant for</Form.Label>
            <Form.Control
              type="email"
              placeholder="email"
              onChange={this.handleEmailChange}
              value={this.state.on_behalf}
            />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Tenure</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="tenure in months"
                  onChange={this.handleTenureChange}
                  value={this.state.tenure}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formBasicmail">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="amount"
                  onChange={this.handleAmountChange}
                  value={this.state.amount}
                />
              </Form.Group>
            </Col>
          </Row>

          <Button variant="primary" type="submit" onClick={this.handleSubmit}>
            Submit
          </Button>
        </Form>
        {this.state.submitted ? (
          <Alert variant="success">
            Your application has been seccessfully submited
          </Alert>
        ) : null}
        {this.state.showError ? (
          <Alert variant="warning">
            Error while submitting your application.
          </Alert>
        ) : null}
      </div>
    );
  }
}
