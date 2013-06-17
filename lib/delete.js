var Delete = function(collection, query, options) {

  this.run = function(callback) {
    // Set up default write concern
    var writeConcern = options.w ? options : (!callback ? {w:0} : {w:1});
    // Execute delete
    collection.remove(query, writeConcern, function(err, result) {
      if(err && callback) {
        return callback({
              deleted: 0
            , errors: 1
            , first_error: err
            , inserted: 0, replaced: 0, unchanged: 0
          });
      }

      if(!callback) return;
      callback(null, {
          deleted: result
        , errors: 0
        , first_error: null
        , inserted: 0, replaced: 0, unchanged: 0
      });
    });
  }
}

exports.Delete = Delete;