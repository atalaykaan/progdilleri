import express from "express";
import mongodb from "mongodb";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const uri = "mongodb+srv://kaanefeatalay:0pA2F26H1vaojKE5@cluster0.yfgo6t2.mongodb.net/?retryWrites=true&w=majority";

const MongoClient = new mongodb.MongoClient(uri);

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));

app.get("/", (req, res) => {
    res.render("index.html");
})

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
    } finally {
        await MongoClient.close();
      }
  });

app.post('/upload', async (req, res) => {
    try {
      await MongoClient.connect();

      const database = MongoClient.db('WatchMe');
      const collection = database.collection('test');
      
      const result = await collection.insertOne({ 
        title: req.body.videotitle, 
        description: req.body.videodescription,
    });
  
      console.log(`Inserted ${result.insertedCount} document into the collection`);
  
      res.redirect("/");
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Internal server error');
  } finally {
    await MongoClient.close();
  }
  });

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});