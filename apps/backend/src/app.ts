import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import locationRoutes from './routes/locations';
import businessCategoryRoutes from './routes/business-categories';
import assessmentRoutes from './routes/assessments';
import { errorHandler } from './middleware/error';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/business-categories', businessCategoryRoutes);
app.use('/api/assessments', assessmentRoutes);

app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

app.use(errorHandler);

export default app;
