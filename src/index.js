require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const gambarRouter = require('./routes/picture');

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(morgan('dev'));

//routes
app.use('/api/v1/gambar',gambarRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})