import React, { Component } from "react";
import axios from "axios";
import MaterialTable from "material-table";
import { Button, Row, Col } from "react-bootstrap";
import jwt from "jsonwebtoken";
export default class loanlist extends Component {
  constructor(props) {
    super(props);
    this.state = this.state = {
      userType: "",
      data: [],
      columns: [],
    };
    this.handleAccept = this.handleAccept.bind(this);
    this.handleReject = this.handleReject.bind(this);
  }

  handleAccept(e) {
    console.log(e);
    let config = {
      method: "post",
      url: `${process.env.REACT_APP_API_URL}/applicationstatusupdate`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${this.props.token}`,
      },
      withCredentials: true,
      data: { approved: true, applicationId: e._id },
    };
    axios(config)
      .then((res) => {
        if (res.status === 200) {
          console.log(res);
          // update data
          let updatedData = [...this.state.data];
          console.log(updatedData);
          updatedData[e.tableData.id].status = "approved";
          this.setState({ data: [...updatedData] }, () => {
            console.log(this.state);
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
  handleReject(e) {
    console.log("e", e);
    let config = {
      method: "post",
      url: `${process.env.REACT_APP_API_URL}/applicationstatusupdate`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${this.props.token}`,
      },
      withCredentials: true,
      data: { approved: false, applicationId: e._id },
    };
    axios(config)
      .then((res) => {
        if (res.status === 200) {
          console.log(res);
          let updatedData = [...this.state.data];
          console.log("Row Data", updatedData);
          updatedData[e.tableData.id].status = "rejected";
          console.log("Data Update", updatedData);
          this.setState({ data: [...updatedData] }, () => {
            console.log("State Update", this.state.data);
            console.log("Full State", this.state);
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
    // update data
  }
  updateBackend(data) {
    let updatedData = {};
    console.log(data);
    updatedData.tenure = data.tenure;
    updatedData.amount = data.amount;
    updatedData.applicationId = data.application_id;

    let config = {
      method: "post",
      url: `${process.env.REACT_APP_API_URL}/applicationupdate`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${this.props.token}`,
      },
      withCredentials: true,
      data: updatedData,
    };
    axios(config)
      .then((res) => {
        if (res.status === 200) {
          console.log(res);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
  componentDidMount() {
    const decoded = jwt.decode(this.props.token);
    let config = {
      method: "post",
      url: `${process.env.REACT_APP_API_URL}/applicationlist`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${this.props.token}`,
      },
      withCredentials: true,
    };
    axios(config)
      .then((res) => {
        if (res.status === 200) {
          console.log(res);
          this.setState({ data: res.data });
        }
      })
      .catch((err) => {
        console.log(err);
      });
    const column = [
      { title: "Submitted by", field: "submitted_by", editable: "never" },
      { title: "On behalf", field: "on_behalf", editable: "never" },
      { title: "amount", field: "amount" },
      { title: "tenure", field: "tenure" },
      { title: "status", field: "status", editable: "never" },
      {
        title: "Other Actions",
        filed: "otherActions",
        render: (rowData) => {
          if (rowData.status === "new") {
            return (
              <div>
                <Row>
                  <Col>
                    <Button
                      variant="success"
                      onClick={() => this.handleAccept(rowData)}
                    >
                      Accept
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      variant="danger"
                      onClick={() => this.handleReject(rowData)}
                    >
                      Reject
                    </Button>
                  </Col>
                </Row>
              </div>
            );
          } else {
            return (
              <div>
                <Row>
                  <Col>
                    <Button variant="success" disabled>
                      Accept
                    </Button>
                  </Col>
                  <Col>
                    <Button variant="danger" disabled>
                      Reject
                    </Button>
                  </Col>
                </Row>
              </div>
            );
          }
        },
      },
    ];
    this.setState({ userType: decoded.userType }, () => {
      console.log(this.state.userType);
      if (this.state.userType !== "admin") {
        column.pop();
      }
      this.setState({ columns: column });
    });
  }
  render() {
    return (
      <div>
        <MaterialTable
          title="Loan Applications"
          columns={this.state.columns}
          data={this.state.data}
          onRowClick={() => {
            // TODO
            console.log("click on row");
          }}
          editable={
            this.state.userType === "agent"
              ? {
                  isEditable: (rowData) => rowData.status === "new",
                  onRowUpdate: (newData, oldData) =>
                    new Promise((resolve) => {
                      setTimeout(() => {
                        const dataUpdate = [...this.state.data];
                        const index = oldData.tableData.id;
                        dataUpdate[index] = newData;
                        this.setState({ data: [...dataUpdate] }, () => {
                          this.updateBackend(newData);
                        });
                        resolve();
                      }, 1000);
                    }),
                }
              : { isEditable: false }
          }
        />
      </div>
    );
  }
}
