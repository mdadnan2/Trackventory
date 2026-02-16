import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDatabase } from './database/connection';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import itemsRoutes from './modules/items/items.routes';
import packagesRoutes from './modules/packages/packages.routes';
import citiesRoutes from './modules/cities/cities.routes';
import campaignsRoutes from './modules/campaigns/campaigns.routes';
import stockRoutes from './modules/stock/stock.routes';
import distributionRoutes from './modules/distribution/distribution.routes';
import reportsRoutes from './modules/reports/reports.routes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/distribution', distributionRoutes);
app.use('/api/reports', reportsRoutes);

app.use(errorHandler);

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;
