const express = require('express')
const shortId = require("shortid")
 const createHttpError = require("http-errors")
const mongoose = require('mongoose')
const path = require('path')
const ShortUrl = require('./models/url.model')



const app = express()
app.use(express.static(path.join(__dirname, 'src')))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

mongoose.connect("mongodb://localhost:27017", {
  dbName:'urlShortener',
  useNewUrlParser:true,
  useUnifiedTopology:true,
  useCreateIndex:true
}).then(() => {
  console.log('mongoose connected!')
 }).catch(() => {
  console.log('error connected!')
 })

app.set('view engine', 'ejs')
app.get('/', async(req, res, next) => {
  res.render('index')
})
app.post("/", async(req, res, next) => {
try{
const { url } = req.body
if(!url){
  throw createHttpError.BadRequest('Provide a Valid Url')
}
const urlExists = await ShortUrl.findOne({ url })
if(urlExists) {
  res.render('index', {short_url: `http://localhost:3000/${urlExists.shortId}` })
  return
}
const shortUrl = new ShortUrl({url:url, shortId: shortId.generate()})
const result = await shortUrl.save()
res.render('index', { short_url: `http://localhost:3000/${result.shortId}`,} )
}catch (error){
next(error)
}
})

app.get('/:shortId', async (req, res, next) => {
  try {
    const { shortId } = req.params
    const result = await ShortUrl.findOne({ shortId })
    if (!result) {
      throw createHttpError.NotFound('Short url does not exist')
    }
    res.redirect(result.url)
  } catch (error) {
    next(error)
  }
})

app.use((res, req, next) => {
next(createHttpError.NotFound())
})

app.use((err, res, req, next) => {
res.status(err.status || 500)

res.render('index', {error: err.message})
})

app.listen(3000, function(req, res){
  console.log("running.....")
})



