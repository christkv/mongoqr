var Cursor = function(collection, query, options) {  
  var currentCursor = null;

  this.each = function(itr_callback, done_callback) {
    if(typeof itr_callback != 'function') throw new Error("Missing Iteration callback");
    if(typeof done_callback != 'function' && done_callback != null) throw new Error("Done callback must be a function or set to null");

    collection.find(query, options).each(function(err, doc) {
      if(err) return itr_callback(err, null);
      
      // Call the done function
      if(doc != null) {
        itr_callback(null, doc);
      } else if(doc == null && typeof done_callback == 'function') {
        done_callback();
      }
    });
  }

  this.toArray = function(callback) {
    if(typeof callback != 'function') throw new Error("Missing callback");
    collection.find(query, options).toArray(callback);
  }

  this.next = function(callback) {
    if(currentCursor == null) {
      currentCursor = collection.find(query, options);      
    }

    currentCursor.nextObject(function(err, doc) {
      if(err) return callback(err, null);
      if(doc == null) currentCursor = null;
      callback(null, doc);
    });      
  }

  this.hasNext = function() {
    if(this.currentCursor == null) return false;
    // Has next if cursor not closed and more than 0 items
    if(this.currentCursor.items.length > 0 
      && this.currentCursor.state != 2) return true;
    return false;
  }
}

exports.Cursor = Cursor;