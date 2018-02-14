var express = require('express');
var app = express();

var bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//your routes here
app.get('/', function (req, res) {
    res.send("Hello World!");
});

app.get('/check_req', function( req, res ) {
  if ( req.query.file_op === 'read' ) {   
    const file_id = req.query.file_id;
    const user_id = req.headers['x-hasura-user-id'];
    
    var url= "https://data.also52.hasura-app.io/v1/query";
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
    const options = {
      
      method: 'POST',
      body: JSON.stringify(queryObj),
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-user-id': '1',
        'x-hasura-role': 'admin'
      }
    }

     fetchAction(url, options)
    .then( function( sol ) {
      return sol.json();
    })
    .then( function( resp ) {
      
      if ( (resp[0].userid).toString() === (user_id).toString() ) {
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

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
