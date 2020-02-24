const DB = require("../../database");

class modelAbstract {
    constructor(model) {
        this.model = model;
        this.dbNotConnectedErr = {message: "No database connection established."}
    }

    create(callback, id = "id") {
        if (DB.getReadyState()) {
            let self = this;
            let query = {};
            query[id] = self[id];
            self.getOne(query, function(err, _item) {
                if (err) {
                    callback(err);
                } else {
                    if (!_item[id]) {
                        this.model.create(self, callback);
                    }
                }
            });
        } else {
            callback(this.dbNotConnectedErr);
        }
    }

    update(callback, id = "id") {
        if (DB.getReadyState()) {
            let self = this;
            let query = {};
            query[id] = self[id];
            self.getOne(query, function(err, _item) {
                if (err) {
                    callback(err);
                } else {
                    if (_item) {
                        this.model.updateOne(query, self, callback);
                    }
                }
            });
        } else {
            callback(this.dbNotConnectedErr);
        }
    }

    save(callback, id = "id") {
        if (DB.getReadyState()) {
            let self = this;
            let query = {};
            query[id] = self[id];
            self.getOne(query, function(err, _item) {
                if (err) {
                    callback(err);
                } else {
                    if (_item) {
                        this.model.updateOne(query, self, callback);
                    } else {
                        this.model.create(self, callback);
                    }
                }
            });
        } else {
            callback(this.dbNotConnectedErr);
        }
    }

    delete(callback, id = "id") {
        if (DB.getReadyState()) {
            let self = this;
            let query = {};
            query[id] = self[id];
            self.deleteOne(query, function(err, result) {
                callback(err, result);
            });
        } else {
            callback(this.dbNotConnectedErr);
        }
    }

    static create(items, callback) {
        DB.transaction(items, "create", callback);
    }

    static update(items, callback) {
        DB.transaction(items, "update", callback);
    }

    static save(items, callback) {
        DB.transaction(items, "save", callback);
    }

    static delete(items, callback) {
        DB.transaction(items, "delete", callback);
    }
}
