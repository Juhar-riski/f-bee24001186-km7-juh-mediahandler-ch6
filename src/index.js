require('dotenv').config();
const Sentry = require('@sentry/node');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const gambarRouter = require('./routes/picture');
const userRoutes = require('./routes/user');
const loginRoutes = require('./routes/login');
const reqResetPassRoutes = require('./routes/reqResetPass')
const loginView = require('./routes/view/login');
const notifView = require('./routes/view/notif');
const swaggerJSON = require('./swagger.json');
const swaggerUI = require('swagger-ui-express');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

const port = process.env.PORT || 4000;

app.set('io', io);

app.use('/api/v1/docs', swaggerUI.serve, swaggerUI.setup(swaggerJSON));

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(morgan('dev'));
app.use(bodyParser.json());

Sentry.init({
  dsn:process.env.DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

app.use((req, res, next) => {
  Sentry.captureMessage(`Incoming request: ${req.method} ${req.url}`, 'info');
  next();
});

//routes
app.use('/home', async (req,res) => {
    res.send('Untuk Swagger ui silahkan click <a href="http://ec2-3-104-119-114.ap-southeast-2.compute.amazonaws.com/api/v1/docs">disini</a>')
});

app.use('/api/v1/gambar',gambarRouter);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/login', loginRoutes);
app.use('/api/v1/password', reqResetPassRoutes);
app.use('/api/v1/view', loginView);
app.use('/api/v1/view', notifView);
app.use(loginRoutes);


app.use((err, req, res, next) => {
  Sentry.captureException(err);
  res.status(500).json({ message: 'Something went wrong!' });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api/v1/docs`);
})