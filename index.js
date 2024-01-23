import express from "express";
import mongodb from "mongodb";
import bodyParser from "body-parser";
import multer from "multer";
import bcrypt from "bcrypt";
import fs from 'fs';
import { Video } from './videoSchema.js';

const app = express();
const port = 3000;
const uri = "mongodb+srv://kaanefeatalay:0pA2F26H1vaojKE5@cluster0.yfgo6t2.mongodb.net/?retryWrites=true&w=majority";
const __dirname = "C:\\Users\\kaane\\OneDrive\\Masaüstü\\VS Code\\WatchMe\\proje";
const storage = multer.memoryStorage();
const upload = multer({ storage });

var userId = 0;
var videoId = 0;
var isLoggedIn = false;

var loggedUserMail = null;

const MongoClient = new mongodb.MongoClient(uri);

app.use(express.static('views'))
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', async (req, res) => {
  try {
    MongoClient.connect();
    const database = MongoClient.db('WatchMe');
    const collection = database.collection('videos');

    const videos = await collection.find({}).toArray();

    res.render('index.ejs', { videos, isLoggedIn });
  } catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/logout', (req, res) => {
    isLoggedIn = false;
    loggedUserMail = null;
    res.redirect("/");
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '\\views\\login.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '\\views\\register.html');
});

app.get('/test', async (req, res) => {
    try {
      await MongoClient.connect();
      const database = MongoClient.db('WatchMe');

      const collection = database.collection('test');

      const videos = await collection.find().toArray();
    
      res.json(videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ error: 'Internal server error' });
    } 
  });

app.post('/upload', async (req, res) => {
    try {
      await MongoClient.connect();

      const database = MongoClient.db('WatchMe');
      const collection = database.collection('videos');

      if(!isLoggedIn){
        res.send("You must login to upload videos")
      } else {
      const result = await collection.insertOne({
        title: req.body.videotitle, 
        description: req.body.videodescription,
      });
      console.log(`uploaded.`);
      res.status(200);
      res.redirect('/');
    }
  
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Internal server error');
  } 
  });

/*app.post('/upload', upload.single('video'), function (req, res) {
    mongodb.MongoClient.connect(uri, function(error, client) {
      if(error){
        res.json(error);
        return
      }
      const db = client.db('videos');
      const bucket = new mongodb.GridFSBucket(db);
      const videoUploadStream = bucket.openUploadStream('test');
      const videoReadStream = fs.createReadStream('./test.mp4');
      videoReadStream.pipe(videoUploadStream);
      res.status(200).send("Done.");
    });
});*/

app.post("/register", async (req, res) => {
  try {
    await MongoClient.connect();

    const database = MongoClient.db('WatchMe');
    const collection = database.collection('users');
    
    const userExists = await collection.findOne({email: req.body.email})
    if(userExists) {
      res.send("User with mail address already exists. Please use another mail address.")
    } else {
      const saltRounds = 10;
      const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
      const result = await collection.insertOne({ 
      user_id: userId,
      username: req.body.username, 
      email: req.body.email,
      password: hashPassword,
  });
    console.log(`Registered ${result.insertedCount} user into the collection`);
    res.status(200);
    isLoggedIn = true;
    loggedUserMail = req.body.email;
    res.redirect('/');
}
} catch (error) {
  console.error('Error inserting data:', error);
  res.status(500).send('Internal server error');
} 
})

app.post("/login", async (req, res) => {
  try {
    await MongoClient.connect();

    const database = MongoClient.db('WatchMe');
    const collection = database.collection('users');

    const check = await collection.findOne({username: req.body.username});
    if(!check){
      res.send("User does not exist");
    } else {
    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
    if(isPasswordMatch){
      res.redirect('/');
    } else {
      res.send("Incorrect password")
    }}
    console.log(`Login successful`);
    isLoggedIn = true;
    const findMail = await collection.findOne({username: req.body.username});
    loggedUserMail = findMail.email;
    res.status(200);
} catch (error) {
  console.error('Error inserting data:', error);
  res.status(500).send('Internal server error');
} 
})

app.delete("/test", async (req, res) => {
  const database = MongoClient.db('WatchMe');
  await database.collection('videos').deleteMany({});
  res.status(200).json({ message: "Posts deleted." });
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});