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
                    } else {
                        callback({message: "Item already exists with " + id + " " + self[id]})
                    }
                }
            });
        } else {
            callback(modelAbstract.getDBNotConnectedError());
        }
    }

    update(callback, id = "id") {
        if (DB.getReadyState()) {
            let self = this;
            delete self["_id"]; //remove ObjectID to prevent key issues in MongoDB
            delete self["createDate"]; //remove createDate to prevent overriding date in database
            let query = generateQuery(self, id);
            this.childClass.getOne(query, function(err, _item) {
                if (err) {
                    callback(err);
                } else {
                    if (_item) {
                        self["updateDate"] = new Date();    //add date when updated
                        self.model.updateOne(query, self, callback);
                    } else {
                        callback({message: "No item exists with " + id + " " + self[id]})
                    }
                }
            });
        } else {
            callback(modelAbstract.getDBNotConnectedError());
        }
    }

    save(callback, id = "id") {
        if (DB.getReadyState()) {
            let self = this;
            delete self["_id"]; //remove ObjectID to prevent key issues in MongoDB
            delete self["createDate"]; //remove createDate to prevent overriding date in database
            let query = generateQuery(self, id);
            this.childClass.getOne(query, function(err, _item) {
                if (err) {
                    callback(err);
                } else {
                    if (_item) {
                        self["updateDate"] = new Date();    //add date when updated
                        self.model.updateOne(query, self, callback);
                    } else {
                        self.model.create(self, callback);
                    }
                }
            });
        } else {
            callback(modelAbstract.getDBNotConnectedError());
        }
    }

    delete(callback, id = "id") {
        if (DB.getReadyState()) {
            let self = this;
            let query = generateQuery(self, id);
            self.model.deleteOne(query, function(err, result) {
                callback(err, result);
            });
        } else {
            callback(modelAbstract.getDBNotConnectedError());
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

    static getDBNotConnectedError() {
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
