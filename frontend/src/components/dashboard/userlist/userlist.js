import React, { Component } from "react";
import MaterialTable from "material-table";
import axios from "axios";
import { Button } from "react-bootstrap";
import jwt from "jsonwebtoken";

class userlist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userType: "",
      data: [],
      columns: [],
    };
    this.handlePromote = this.handlePromote.bind(this);
  }
  handlePromote(e) {
    // update backend
    console.log(e);
    let config = {
      method: "post",
      url: `${process.env.API_URL}/promotion`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${this.props.token}`,
      },
      withCredentials: true,
      data: { email: e.email },
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
    // update data
    let updatedData = [...this.state.data];
    updatedData[e.tableData.id].userType = "agent";
    this.setState({ data: updatedData });
  }
  componentDidMount() {
    const decoded = jwt.decode(this.props.token);
    let config = {
      method: "post",
      url: `${process.env.API_URL}/userlist`,
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

    //
    const column = [
      { title: "ID", field: "_id", editable: "never" },
      { title: "UserName", field: "userName" },
      {
        title: "UserType",
        field: "userType",
        editable: "never",
      },
      { title: "Email", field: "email", editable: "never" },
      {
        title: "Other Actions",
        filed: "otherActions",
        render: (rowData) => {
          if (rowData.userType === "customer") {
            return (
              <Button
                variant="success"
                onClick={() => this.handlePromote(rowData)}
              >
                Promote
              </Button>
            );
          } else {
            return (
              <Button variant="success" disabled>
                Promote
              </Button>
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
  updateBackend(data) {
    // update backend
    console.log(data)
    let config = {
      method: "post",
      url: `${process.env.API_URL}/edituser`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${this.props.token}`,
      },
      withCredentials: true,
      data: { email: data.email, userName: data.userName },
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
  render() {
    return (
      <div>
        <MaterialTable
          filtering={false}
          title="Users"
          columns={this.state.columns}
          data={this.state.data}
          onRowClick={() => {
            // TODO
            console.log("click on row");
          }}
          editable={{
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
                }, 0);
              }),
          }}
        />
      </div>
    );
  }
}

export default userlist;
