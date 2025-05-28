const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        const options = {
            dbName: 'examify',
            retryWrites: true,
            w: 'majority'
        };
        
        await mongoose.connect(process.env.MONGO_URI, options);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;