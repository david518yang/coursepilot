// Importing mongoose library along with Connection type from it
import mongoose, { Connection } from 'mongoose';

// Declaring a variable to store the cached database connection
let isConnecting = false;
let cachedConnection: Connection | null = null;

// Function to establish a connection to MongoDB
export async function connectToMongoDB() {
  // If we have a cached connection and it's ready, use it
  if (cachedConnection?.readyState === 1) {
    return cachedConnection;
  }

  // If already connecting, wait for it
  if (isConnecting) {
    console.log('Connection in progress, waiting...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (cachedConnection?.readyState === 1) {
      return cachedConnection;
    }
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }

    isConnecting = true;
    console.log('Establishing new MongoDB connection...');

    const options = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      connectTimeoutMS: 10000,
    };

    // Establish new connection
    await mongoose.connect(process.env.MONGODB_URI + '/Courses', options);
    cachedConnection = mongoose.connection;

    // Set up event handlers
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      cachedConnection = null;
      isConnecting = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      cachedConnection = null;
      isConnecting = false;
    });

    isConnecting = false;
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnecting = false;
    throw error;
  }
}
