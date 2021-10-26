require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const mongoUrl = process.env["MONGO_URI"];
const regExUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;


const AutoIncrement = require('mongoose-sequence')(mongoose);

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connect to MongoDB succeed"))
  .catch(() => console.log("Connect to MongoDB failed"));

const urlSchema = mongoose.Schema({
  original_url: { type: String, required: true, unique: true },
  short_url: Number
});

urlSchema.plugin(AutoIncrement, { inc_field: 'short_url' });

const urlAdress = mongoose.model("urlList", urlSchema);


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


app.post('/api/shorturl/', function(req, res) {



    if (regExUrl.test(req.body.url)){
        const original_url = { original_url: req.body.url };
      urlAdress.create(original_url, function(err, url) {
         if(url){
           return res.json({original_url :url.original_url,short_url : url.short_url})
         } 
         else {
           const query = urlAdress.where(original_url);
          query.findOne(function(err, urlAddress) {
            if (err) return handleError(err);
            if (urlAddress) {              
              res.json({original_url :urlAddress.original_url,short_url : urlAddress.short_url});
            }
          })
         }
  })
    } else {
        res.json({ error: 'invalid url' });
    }

  
});

app.get("/api/shorturl/:short_url", function(req, res) {

  const query = urlAdress.where({ short_url: req.params.short_url });
  query.findOne(function(err, urlAdress) {
    if (err) return handleError(err);
    if (urlAdress) {
      console.log(urlAdress.original_url);
      res.redirect(urlAdress.original_url)
    }
    
  })
});