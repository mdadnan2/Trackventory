import mongoose from 'mongoose';

export const withTransaction = async <T>(
  callback: (session: mongoose.ClientSession | null) => Promise<T>
): Promise<T> => {
  // Check if replica set is available
  const isReplicaSet = mongoose.connection.readyState === 1 && 
    mongoose.connection.db?.admin().serverStatus !== undefined;

  if (!isReplicaSet || process.env.NODE_ENV === 'development') {
    // Run without transaction for standalone MongoDB
    return callback(null);
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
