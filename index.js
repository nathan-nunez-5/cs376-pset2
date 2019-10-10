let express = require('express')
let fs = require('fs')
let bodyParser = require('body-parser')
const apikey = 'eeb7e1a0-d3f4-11e9-a98b-17c2205dae62'

let urlencodedParser = bodyParser.urlencoded({ extended: false })

let app = express()
const port = 8000
app.listen(port)

app.set('view engine', 'ejs')

app.use('/assets', express.static('assets'))

app.get('/', function(request, response){
	response.render('default');
})

app.get('/gallery', function(request, response){
  console.log(request)
  console.log(response)
})

app.get('/gallery/:galleryid', function(request, response){
  console.log(request)
  console.log(response)
})

app.get('/object', function(request, response){
  console.log(request)
  console.log(response)
})

app.get('/object/:objectid', function(request, response){
  console.log(request)
  console.log(response)
})
