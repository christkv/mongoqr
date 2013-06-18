var ObjectID = require('mongodb').ObjectID;

var Insert = function(collection, docs, options) {
  var upsert = options.upsert || false;
  var ids = [];

  // Assign object id's if none
  for(var i = 0; i < docs.length; i++) {
    if(!docs[i]._id) {
      ids.push(docs[i]._id);
      docs[i]._id = new ObjectID();
    }
  }

  // Execute command
  this.run = function(callback) {    
    // Write concern
    var writeConcern = !callback ? {w:0} : {w:1};
    var errors = 0;
    var first_error = null;

    // Do we have an upsert
    if(upsert) {
      // collection.update(query, query, )
      var docsDone = docs.length;
      writeConcern.upsert = true;
      var replaced = 0;
      var inserted = 0;

      for(var i = 0; i < docs.length; i++) {
        collection.update(docs[i], docs[i], writeConcern, function(err, result, update_doc) {
          docsDone = docsDone - 1;

          if(err && !first_errors) {
            first_errors = err;
          } else {
            if(update_doc.updatedExisting) replaced++;
            if(!update_doc.updatedExisting) inserted++;
          }

          if(docsDone == 0) {
            if(!callback) return;
            return callback(null, {
                errors: errors
              , generated_keys: ids
              , inserted: inserted, replaced: replaced, unchanged: 0
              , first_error: first_error
              , deleted: 0, skipped: 0              
            })
          }
        });
      }

      return;
    } 

    // Insert a collection
    collection.insert(docs, writeConcern, function(err, docs) {
      if(err && callback) {
        first_error = first_error;
        errors = 1;
      }

      if(!callback) return;
      return callback(null, {
          inserted: docs.length
        , errors: errors, first_error: first_error
        , replaced: 0, unchanged: 0        
        , generated_keys: ids
        , deleted: 0, skipped: 0, errors: 0, first_error: null
      });
    });
  }
}

exports.Insert = Insert;