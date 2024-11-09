require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const gambarRouter = require('./routes/picture');
const swaggerJSON = require('./swagger.json');
const swaggerUI = require('swagger-ui-express');

const app = express();
const port = process.env.PORT || 4000;

app.use('/api/v1/docs', swaggerUI.serve, swaggerUI.setup(swaggerJSON));

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(morgan('dev'));

//routes
app.use('/api/v1/gambar',gambarRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api/v1/docs`);
})