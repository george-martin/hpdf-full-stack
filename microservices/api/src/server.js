var express = require('express');
var app = express();
var router = express.Router();

var server = require('http').Server(app);

var fetchAction = require('node-fetch');

var fs = require('file-system');

var path = require("path");

var rp = require('request-promise');

var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');


/*app.use(fileUpload());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});*/


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.get('/',function(req,res){
  res.send("heyyy");
})

app.get('/check_req', function( req, res ) {
  if ( req.query.file_op === 'read' ) {   
    const file_id = req.query.file_id;
    const user_id = req.headers['x-hasura-user-id'];

    const queryObj = {
      "type": "select",
      "args": {
          "table": "files",
          "columns": [
              "userid"
          ],
          "where": {
              "fileid": {
                  "$eq": file_id
              }
          }
      }
    };

    var url= "https://data.also52.hasura-app.io/v1/query"
    const options = {
      
      method: 'POST',
      body: JSON.stringify(queryObj),
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-user-id': '1',
        'x-hasura-role': 'admin'
      }
    }

    return fetchAction(url, options)
    .then( function( resp ) {
      resp = JSON.parse(resp);
      if ( resp[0].userid === user_id ) {
        res.status(200).send('ok');
        return;
      }
      res.status(403).send('notok');
      return;
    })
    .catch( function ( resp ) {
      res.status(403).send('notok');
      return;
    });
  }  else {
    res.status(200).send('ok');
  }
});


app.get('/logout',function(req,res){ 
  var auth_token = req.body.data.auth_token;
var url = "https://auth.also52.hasura-app.io/v1/user/logout";

var authority = "Bearer " + auth_token;
// If you have the auth token saved in offline storage
// var authToken = window.localStorage.getItem('HASURA_AUTH_TOKEN');
// headers = { "Authorization" : "Bearer " + authToken }
var requestOptions = {
    "method": "POST",
    "headers": {
        "Content-Type": "application/json",
        "Authorization": authority
      }
  };

    fetchAction(url, requestOptions)
    .then(function(response) {
      return response.json();
    })
    .then(function(result) {
      console.log(result);
      
	    res.send(result);
    })
    .catch(function(error) {
      console.log('Request Failed:' + error);
    });
  
})

app.post('/profile',function(req,res){
  var auth_token = req.body.data.auth_token;
  var authority = "Bearer " + auth_token;
  var url = "https://auth.also52.hasura-app.io/v1/user/info";
  var requestOptions = {
    "method": "GET",
    "headers": {
        "Content-Type": "application/json",
        "Authorization": authority
    }
  };
  fetchAction(url, requestOptions)
  .then(function(response) {
    return response.json();
    })
  .then(function(result) {
    var userId = result.hasura_id;
    var username = result.username;
    var userurl = "https://data.also52.hasura-app.io/v1/query";
    var userrequestOptions = {
      "method": "POST",
      "headers": {
          "Content-Type": "application/json",
          "Authorization": authority
        }
      };
      var body = {
        "type": "select",
        "args": {
            "table": "files",
            "columns": [
                "fileid",
                "filename"
            ],
            "where": {
                "userid": {
                    "$eq": userId
                  }
                }
            }
        };
        userrequestOptions.body = JSON.stringify(body);

        fetchAction(userurl, userrequestOptions)
        .then(function(resp) {
          return resp.json();
          })
        .then(function(reslt) {
          var userinfo = {}
          userinfo.username = username;
          userinfo.files = reslt;
          console.log(userinfo);
          res.send(userinfo);
          })
        .catch(function(error) {
          console.log('Request Failed:' + error);
          });
      })
  .catch(function(error) {
    console.log('Request Failed:' + error);
    });
  
});


app.post('/login',function(req,res){
  var url = "https://auth.also52.hasura-app.io/v1/login";
  var sign_email= req.body.data.username;
  var sign_pass= req.body.data.password;
  var requestOptions = {
    "method": "POST",
    "headers": {
        "Content-Type": "application/json"
      }
  };
  var body = {
    "provider": "username",
    "data": {
        "username": sign_email,
        "password": sign_pass
      }
  };
  requestOptions.body = JSON.stringify(body);

  fetchAction(url, requestOptions)
  .then(function(response) {
    return response.json();
    })
  .then(function(result) {
    res.send(result)  
    })
  .catch(function(error) {
    console.log('Request Failed:' + error);
   });
});

app.post('/signup',function(req,res){
  var url = "https://auth.also52.hasura-app.io/v1/signup";

  var sign_email= req.body.data.username;
  var sign_pass= req.body.data.password;
var requestOptions = {
    "method": "POST",
    "headers": {
        "Content-Type": "application/json"
    }
};

var body = {
    "provider": "username",
    "data": {
        "username": sign_email,
        "password": sign_pass
    }
};

requestOptions.body = JSON.stringify(body);

fetchAction(url, requestOptions)
.then(function(response) {
	return response.json();
})
.then(function(result) {
  res.send(result);  
})
.catch(function(error) {
	console.log('Request Failed:' + error);
});

});


app.post('/upload',function(req,res){

    var file_id = req.body.data.fileid;
    var user_id = req.body.data.user_id;
    var file_name = req.body.data.file_name;
    var authtoken = req.body.data.auth_token;
    var authority = "Bearer " + authtoken;
    var fileurl = "https://data.also52.hasura-app.io/v1/query";
    var filerequestOptions = {
      "method": "POST",
      "headers": {
          "Content-Type": "application/json",
          "Authorization": authority
      }
  };
  var body = {
    "type": "insert",
    "args": {
        "table": "files",
        "objects": [
            {
                "fileid": file_id,
                "userid": user_id,
                "filename": file_name
            }
          ]
      }
    };
    filerequestOptions.body = JSON.stringify(body);

    fetchAction(fileurl, filerequestOptions)
    .then(function(resp) {
      return resp.json();
      })
    .then(function(reslt) {
      res.send(reslt)
      })
    .catch(function(error) {
      console.log('Request Failed:' + error);
      res.send(error)
      });
  

})
// Uncomment to add a new route which returns hello world as a JSON
// app.get('/json', function(req, res) {
//   res.json({
//     message: 'Hello world'
//   });
// });

/*app.post('/download',function(req,res){
  
  var auth_token = req.body.data.token;
  var authority = "Bearer " + auth_token;
  var fileid = req.body.data.file_id;  
  var url = "https://filestore.concavity27.hasura-app.io/v1/file/" + fileid;

      var requestOptions = {
        "method": "GET",
        "headers": {
            "Authorization": authority
        }
    };

    fetchAction(url, requestOptions)
    .then(function(response){
      res.send(response);
    })

    .catch(function(error) {
      console.log('Request Failed:' + error);
    });
            
            
    

  
});*/



// custom 404 page
app.use(function(req, res){
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});

// custom 500 page1

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
