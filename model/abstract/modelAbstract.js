const DB = require("../../database");

class modelAbstract {
    constructor(model, childClass) {
        this.model = model;
        this.childClass = childClass;
    }

    create(callback, id = "id") {
        if (DB.getReadyState()) {
            let self = this;
            let query = generateQuery(self, id);
            this.childClass.getOne(query, function(err, _item) {
                if (err) {
                    callback(err);
                } else {
                    if (!_item || id == null) {
                        self.model.create(self, callback);
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
            let query = generateQuery(self, id);
            this.childClass.getOne(query, function(err, _item) {
                if (err) {
                    callback(err);
                } else {
                    if (_item) {
                        self.model.updateOne(query, self, callback);
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
            let query = generateQuery(self, id);
            this.childClass.getOne(query, function(err, _item) {
                if (err) {
                    callback(err);
                } else {
                    if (_item) {
                        self.model.updateOne(query, self, callback);
                    } else {
                        self.model.create(self, callback);
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
            let query = generateQuery(self, id);
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

    static new(items) {
        let self = this;
        let _return = [];
        for (let i=0; i<items.length; i++) {
            _return.push(new self(items[i]));
        }
        return _return;
    }

    getDBNotConnectedError() {
        return {message: "No database connection established."};
    }
}

function generateQuery(self, id) {
    let query = {};
    if (id) {
        query[id] = self[id];
    } else {
        query = null;
    }

    return query;
}

module.exports = modelAbstract;
