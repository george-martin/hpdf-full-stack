import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import { uploadFile } from './api';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';
import { withRouter } from 'react-router-dom';
import { saveOffline, getSavedToken } from './config';
 class Profile extends Component{
    constructor() {
        super()
        this.state = {
          isUploadingFile: false,
          showAlert: false,
          alertMessage: '',
          file_name: '', 
          username:'',
          fileinfo:[]
           
        }
      }

      componentDidMount(){
        var name='';
        var url = "https://api.also52.hasura-app.io/profile"
        var token = getSavedToken();
        var requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
              data: {
                "auth_token" : token
              }
            })
        };
        fetch(url, requestOptions)
        .then(function(response) {
            return response.json();
        })
        .then(result => {
          let fileinfo = result.files.map((details) => {
            return(
              <button type='button' value={details.fileid} name="download_file" onClick={(e) => {

                var requestOptions = {
                  "method": "GET",
                  "headers": {
                    "Authorization": "Bearer " + token
                  }
              };
                return fetch("https://filestore.also52.hasura-app.io/v1/file/" + details.fileid,requestOptions)
                .then(function(response){
                  return response.blob();
                })
                .then(function(blob) {
                  console.log(blob);
                })
                .catch(function(error) {
                  console.log('Request Failed:' + error);
                });
              }} >{details.filename}</button>
            )
          })
          this.setState({fileinfo : fileinfo})
          return(
            <h1>{result.username}</h1>
          )
        })
        .then(userinfo => {
          this.setState({username: userinfo});
        })
        .catch(function(error) {
            console.log('Request Failed:' + error);
        });
      }
    
      showProgressIndicator = (shouldShow) => {
        this.setState({
          ...this.state,
          isUploadingFile: shouldShow
        })
      }
    
      showAlert = (message) => {
        this.setState({
          ...this.state,
          showAlert: true,
          alertMessage: message
        })
      }
    
      handlenameChange = (e) => {
        this.setState({
          ...this.state,
          file_name: e.target.value
        });
      }


      closeAlert = () => {
        this.setState({
          ...this.state,
          showAlert: false,
          alertMessage: ''
        })
      }
    
      handleFileUpload = (file) => {
        const authToken = getSavedToken();
        if (!authToken) {
          this.showAlert('Please login first. Go to /auth to login');
          return;
        }
        this.showProgressIndicator(true)
        uploadFile(file,this.state.file_name,authToken).then(response => {
          this.showProgressIndicator(false)
          if (response.file_id) {
            this.showAlert("File uploaded successfully: " + JSON.stringify(response, null, 4));
          } else {
            this.showAlert("File upload failed: " + response);
          }
        }).catch(error => {
          console.log('File upload failed: ' + error);
        });
      }
    
    render(){

        const containerStyle = {
            top:'10%',
            left: '80%',
            transform: 'translate(-50%,-50%)',
            position: 'fixed',
            padding: '20px'
          }
        return(
      <div>
        <div>
          <Paper style={containerStyle}>
            <div>
             <div>{this.state.username}</div>
            </div>
          <TextField
                onChange={this.handlenameChange}
                floatingLabelText="Filename"
                
                hintText="Filename"/>
            <div>
              <input type="file" className="form-control" placeholder="Upload a file"/>
            </div> &nbsp;
            <FlatButton
              label="Upload File"
              secondary={true}
              onClick={(e) => {
                e.preventDefault();
                const input = document.querySelector('input[type="file"]');
                if (input.files[0]) {
                  this.handleFileUpload(input.files[0])
                } else {
                  this.showAlert("Please select a file")
                }
              }}/>
                        <button type='button' value='logout' name="logout" onClick={(e) => {
            var token1 = getSavedToken();
            var url = "https://auth.also52.hasura-app.io/v1/user/logout";
            var requestOptions = {
              "method": "POST",
              "headers": {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer " + token1
              }
          };
          return fetch(url,requestOptions)
                .then(function(response){
                  this.props.history.push('/');
                })
          }}>Logout</button>
          </Paper>
          {this.state.isUploadingFile ? <CircularProgress /> : null}
          <Dialog
            actions={[
              <FlatButton
                label="Dismiss"
                secondary={true}
                onClick={this.closeAlert}
              />
            ]}
            modal={false}
            open={this.state.showAlert}
            onRequestClose={this.closeAlert}>
            {this.state.alertMessage}
          </Dialog>

        </div>
        <div>
          {this.state.fileinfo}
        </div>
      </div>
        )
    }
}

  
export{ 
    Profile
}