const { connect, connection, default: mongoose } = require("mongoose");

module.exports = class Mongoose {
  constructor() {}
  init() {
    const dbOptions = {
      autoIndex: false,
      family: 4,
      connectTimeoutMS: 10000,
    };

    connect(process.env.MongoDB, dbOptions);
    mongoose.Promise = global.Promise;
    connection.on("connected", () => {
      console.log("Connected to MongoDB Successfully!");
    });

    connection.on("err", (error) => {
      console.log(`Error recieved from MongoDB: \n${error.message}`);
    });

    connection.on("disconnected", () => {
      console.log("MongoDB has been Disconnected!");
    });
  }
};
