var Cursor = require("./cursor").Cursor
  , Insert = require("./insert").Insert
  , Delete = require("./delete").Delete
  , ObjectID = require("mongodb").ObjectID;

var PreCursor = function(db) {  
  var collection;
  var query = {};
  var self = this;
  var insertOp = null;
  
  // Get the collection
  this.collection = function(name) {
    collection = db.collection(name);
    return self;
  }

  // Run the query
  this.run = function() {
    return new Cursor(collection, query);
  }

  // Get a single doc
  this.get = function(id) {
    query = {_id: id};
    return self;
  }

  // Insert
  this.insert = function(docs, options) {
    docs = Array.isArray(docs) ? docs : [docs];
    options = options || {};
    return new Insert(collection, docs, options);
  }

  // Delete
  this.delete = function(options) {
    options = options || {};
    return new Delete(collection, query, options);
  }
}

exports.PreCursor = PreCursor;