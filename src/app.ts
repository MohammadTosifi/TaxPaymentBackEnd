// General Imports
import express from 'express';
import morgan from 'morgan';
import chalk from 'chalk';
import cors from 'cors';
import bodyParser from 'body-parser';

// Import Utils
import AppError from './utils/appError';

// Import Controllers
import globalErrorHandler from './controllers/errorController/errorController';

// Import Routes
import authRoutes from './routes/authRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import userRoutes from './routes/userRoutes';
import keyManagementRoutes from './routes/keyManagementRoutes';

// Import Middlewares

export const ROUTE_NOT_FOUND = 'Cannot find the following route on this server! :';

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use(express.json());

app.use(cors());

process.env.FORCE_COLOR = 'true';

if (process.env.NODE_ENV !== 'production') {
  morgan.token('status-color', (req, res) => {
    const status = res.statusCode;
    let color = chalk.green; // Default to green for success
    if (status >= 400) {
      color = chalk.red; // Red for error status codes
    } else if (status >= 300) {
      color = chalk.yellow; // Yellow for redirect status codes
    }
    return color(status.toString());
  });

  // Use the custom token in the morgan format
  app.use(
    morgan((tokens, req, res) => {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        '-',
        tokens['status-color'](req, res), // Use 'status-color' token
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
      ].join(' ');
    }),
  );
}

// Declare routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/keys', keyManagementRoutes);

// if there is no matching route
app.all('*', (req, res, next) => {
  next(new AppError(`${ROUTE_NOT_FOUND} ${req.originalUrl} `, 404));
});

app.use(globalErrorHandler);

export default app;
