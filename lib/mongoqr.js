var MongoClient = require('mongodb').MongoClient
  , Q = require("./q").Q
  , PreCursor = require("./pre_cursor").PreCursor;

var MongoQr = function(url, options) { 
  var mongoClient = new MongoClient();
  var instanceDb = null;
  var currentDb = null;
  var self = this;

  // Connection method
  this.connect = function(callback) {
    mongoClient.connect(url, options, function(err, db) {
      if(err) return callback(err, null);
      currentDb = instanceDb = db; 
      return callback(null, self);
    });
  }

  // Close the connection
  this.close = function() {
    instanceDb.close();
  }

  this.use = function(db) {
    currentDb = instanceDb.db('db');
    return self;
  }

  this.db = function(db) {
    return new PreCursor(instanceDb.db(db));
  }
}

MongoQr.Q = Q;
exports.MongoQr = MongoQr;