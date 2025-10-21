const express=require('express');
const dotenv=require('dotenv').config();
const cors=require('cors');
const connectDB = require('./config/db');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); 
app.use(cors());    

// Connect to Database
connectDB();

// Starting the server
app.listen(PORT, async () => {
     console.log(`Server is running on port ${PORT}`);
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello World');
});