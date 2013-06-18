var Cursor = require("./cursor").Cursor
  , AggregationCursor = require("./aggregation_cursor").AggregationCursor;

var Matcher = function(collection, query) {
  var self = this;
  var projection = null;
  // Tells us if we can perform a simple find
  // or need to perform an aggregation command
  var asAggregation = false;

  // Set up the query
  this.run = function() {    
    if(asAggregation) {
      return new AggregationCursor(collection, query, projection);
    } else {
      return new Cursor(collection, query);      
    }
  }

  this.project = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    var _projection = {};
    // Go over all the values
    for(var i = 0; i < args.length; i++) {
      var q = args[i];
      // We cannot do a simple find anymore
      if(q.c || q.query) asAggregation = true;
      // Do we have a create field command
      if(q.c) {
        for(var name in q.c) {
          _projection[name] = q.c[name];
        }
      } else if(q.query) {
        // Do we have a create field command with no modifiers
        var _query = q.query();
        if(_query.c) {
          for(var name in _query.c) {
            _projection[name] = _query.c[name];
          }          
        }
      } else if(q.i) {
        // Do we have an include field
        for(var name in q.i) {
          _projection[name] = q.i[name];
        }                  
      } else if(q.e) {
        for(var name in q.e) {
          _projection[name] = q.e[name];
        }                  
      }
    }
    
    // Save the projection
    projection = _projection;
    // Return the possible methods
    return {
      run: self.run
    }
  }

  this.to_query = function() {
    return query.to_query();
  }
}

exports.Matcher = Matcher;