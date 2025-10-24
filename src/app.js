const express=require('express');
const dotenv=require('dotenv').config();
const cors=require('cors');
const connectDB = require('./config/db');
const authRoute = require('./routes/authRoute');
const availabilityRoute = require('./routes/availabilityRoute');
const appointmentRoute = require('./routes/appointmentRoute');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); 
app.use(cors());    

// Connect to Database
connectDB();

// Routes
app.use('/auth', authRoute);
app.use('/availability', availabilityRoute);
app.use('/appointment', appointmentRoute);

// Starting the server
app.listen(PORT, async () => {
     console.log(`Server is running on port ${PORT}`);
});

// Test
app.get('/', (req, res) => {
  res.send(' API is running');
});

module.exports = app;