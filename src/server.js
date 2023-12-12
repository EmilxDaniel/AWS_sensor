const express = require('express');
const path=require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs');
const collection=require('./mongodb');
const hbs=require('hbs');

const viewpath=path.join(__dirname,'../public')

const app = express();
app.set('view engine', 'hbs');
app.set('views',viewpath);
const PORT = process.env.PORT || 3000;

// Load AWS S3 credentials from config
aws.config.loadFromPath('../config/aws-config.json');
const s3 = new aws.S3();

// Connect to MongoDB
/*mongoose.connect('mongodb://127.0.0.1:27017/sensor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define MongoDB schema and model
const fileSchema = new mongoose.Schema({
  fileName: String,
  s3Url: String,
  uploadDate: { type: Date, default: Date.now },
});

const File = mongoose.model('File', fileSchema);*/

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');

// Serve HTML and CSS for the form
app.get('/', (req, res) => {
  // const html = fs.readFileSync('index.html', 'utf8');
  // res.send(html);
  res.render('index');
});

// Handle file upload and store information in MongoDB and S3
app.post('/upload', upload, async (req, res) => {
  try {
    const file = req.file;

    // Upload to AWS S3
    const s3Params = {
      Bucket: 'sensorbucketaws',
      Key: `uploads/${file.originalname}`,
      Body: file.buffer,
    };

    const s3Response = await s3.upload(s3Params).promise();

    // Save file information to MongoDB
    // const newFile = new File({
    //   fileName: file.originalname,
    //   s3Url: s3Response.Location,
      
    // });
    const data={
        file_name: file.originalname,
        s3URL: s3Response.Location,
        date: Date.now(),
    }
    await collection.insertMany([data]);
    console.log(file.originalname);
    console.log(s3Response.Location);

    // await newFile.save()
    // .then(() => console.log('File saved to MongoDB'))
    // .catch(error => console.error('Error saving file to MongoDB:', error));

    // res.status(201).json({ message: 'File uploaded successfully', file: newFile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Retrieve file information from MongoDB
app.get('/files', async (req, res) => {
  try {
    const files = await collection.find();
    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
