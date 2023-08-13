const mongoose = require('mongoose')
const mongoURI = 'mongodb+srv://sagarkhatridk:10102000mongo@cluster0.wlv1zuq.mongodb.net/inotebook'

const connectToMongo = async () => {
    try {
      const conn = await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
      });
      console.log(`MongoDB Connected: {conn.connection.host}`);
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }

module.exports = connectToMongo