const app = require('express')();
const http = require('http').Server(app);
var GLOBALS = require('./config/constants');
const port = process.env.PORT || 3000;
var db = require('./config/db');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// GET PRODUCT LIST 
app.post('/get_product_list', (req, res) => {
  var params = req.body;
  let page = params.page_token;
  let limit = (parseInt(page) * parseInt(GLOBALS.PER_PAGE));
  var page_token = (limit != undefined) ? " LIMIT " + limit + "," + GLOBALS.PER_PAGE + "" : "";
  var search = '';
  if (params.search) {
    search += " AND product_name like '%" + params.search + "%'"
  }
  db.query("SELECT *,CONCAT('" + GLOBALS.PRODUCT_IMAGE + "',image) as image, from_unixtime(created_at) as date FROM tbl_product WHERE is_active=1 and is_deleted=0 " + search + page_token, function (_error, responseData) {
    // console.log(this.sql);
    if (!_error) {
      if (responseData && responseData.length > 0) {
        var data = {
          page_token: parseInt(page) + 1,
          result: responseData
        }
        var response =
        {
          "code": 1,
          "message": "Product List"
        }
        if (data != null) {
          response["data"] = data;
        }
        res.json(data);

      } else {
        var response =
        {
          "code": 2,
          "message": "No data found"
        }

        res.json(response);
      }

    } else {
      var response =
      {
        "code": 0,
        "message": _error.sqlMessage
      }

      res.json(response);
    }
  });
});


http.listen(port, () => {
  console.log(` server running at http://localhost:${port}/`);
});
