const mongoose = require("mongoose");

const logModule = "chassis-database";

class Database {
    /**
     * Initialise database connection.
     *
     * @param {Function} callback
     * @param {Object} [options]
     */
    static init(callback, options) {
        let _config = config.getConfigByID("db");
        options = _config ? _config.data : undefined;

        if (!options) {
            callback({message: "Cannot connect to database, no configuration found."});
        } else {
            if (!mongoose.connection.readyState) {  //disconnected
                Log.info("Initialising database connection...", logModule);
                connect(function(err, DB) {
                    if (err) {
                        callback(err);
                    } else {
                        Log.info("Established database connection.", logModule);
                        callback(null, DB);
                    }
                }, options);
            } else if (mongoose.connection.readyState === 2) {  //connecting
                wait(0);
            } else if (mongoose.connection.readyState === 1) {  //connected
                callback(null, DB);
            } else {
                callback({message: "Failed to establish a connection to the database."});
            }

            function wait(i) {
                Log.info("Waiting for database to complete initialisation...", logModule);
                setTimeout(function() {
                    if (i < 5) {
                        if (mongoose.connection.readyState) {
                            callback(null);
                        } else {
                            wait(i+1);
                        }
                    }
                }, 5000);
            }
        }
    }

    static getMongoose() {
        return mongoose;
    }

    static getModel() {

    }

    static getAbstractModel() {
        return require("./model/abstract/modelAbstract");
    }

    static getReadyState() {
        return mongoose.connection.readyState;
    }

    /**
     *
     * @param {Array} data - Array of instances
     * @param {String} method - Method to call on the instance
     * @param {Function} callback
     * @param {Object} [options] - Optional additional options
     */
    static transaction(data, method, callback, options) {
        let counter = 0;
        let response = {
            err: [],
            success: []
        };

        for (let i=0; i<data.length; i++) {
            data[i][method](function(err, res) {
                if (err) {
                    response.err.push(err);
                } else {
                    response.success.push(res);
                }

                reqComplete();
            }, options);
        }

        function reqComplete() {
            counter++;

            if (counter === data.length) {    //if all requests have completed
                callback(response);
            }
        }
    }
}

function connect(callback, options) {
    options.authSource = options.authSource ? options.authSource : "admin";
    options.socketTimeoutMS = options.socketTimeoutMS ? options.socketTimeoutMS : 0;
    options.keepAlive = options.keepAlive ? options.keepAlive : true;
    options.poolSize = options.poolSize ? options.poolSize : 5;
    options.useNewUrlParser = options.useNewUrlParser ? options.useNewUrlParser : true;

    mongoose.connect("mongodb://" + options.host + ":" + options.port + "/" + options.dbName + "?authSource=" + options.authSource, options);
    let DB = mongoose.connection;

    DB.on("error", function (err) {
        callback(err);
    });

    DB.once("open", function () {
        callback(null, DB);
    });
}

module.exports = Database;
