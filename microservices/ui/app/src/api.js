import fetch from 'isomorphic-fetch';
import { projectConfig } from './config';
const authenticateUser = (username, password, shouldSignUp) => {
    var path = shouldSignUp ? '/signup' : '/login';
    var requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          provider: "username",
          data: {
            "username": username,
            "password": password
          }
        })
    };
  
    return fetch(projectConfig.url.auth + path, requestOptions)
    .then(function(response) {
      return response.json();
    })
    .catch(function(error) {
      console.log('Request Failed:' + error);
    });
  }

  const signout = (auth_token) => {
    var token1 = auth_token;
    var url = "https://api.also52.hasura-app.io/logout";
    var requestOptions = {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
        
        data: {
          "auth_token": token1,
        }
      })
  };
  return fetch(url,requestOptions)
        .then(function(response){
          return (response)
        })
  }
  const uploadFile = (file,filenam,authToken) => {
    const options = {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': file.type,
          'AUthorization': 'Bearer ' + authToken
        }
      };
    return fetch(projectConfig.url.filestore + "/" , options)
    .then(function(response) {
      return response.json();
    })
    .then(function(result){
      var fileid = result.file_id;
      var user_id = result.user_id;
      const filedetails = {
        method: 'POST',
        headers:{
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: {
            "fileid": fileid,
            "file_name": filenam,
            "user_id":user_id,
            "auth_token":authToken
          }
        })
      }
      return fetch(projectConfig.url.file, filedetails)
      .then(function(response) {
        return response.json();
      })
    })
    .catch(function(error) {
      return Promise.reject('File upload failed: ' + error);
    })
  }

  export {
    
    authenticateUser,
    uploadFile,
    signout
  }
