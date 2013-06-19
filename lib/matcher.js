var Cursor = require("./cursor").Cursor
  , AggregationCursor = require("./aggregation_cursor").AggregationCursor;

var Matcher = function(collection, query) {
  var self = this;
  var projection = null;  
  var query = query == null ? {} : query.to_query();
  // Tells us if we can perform a simple find
  // or need to perform an aggregation command
  var asAggregation = false;  
  var pipeline = [{$match: query}];
  var options = {};

  // Set up the query
  this.run = function() {    
    if(asAggregation) {
      return new AggregationCursor(collection, pipeline);
    } else {
      return new Cursor(collection, query, options);      
    }
  }

  this.filter = function(query) {
    asAggregation = true;
    pipeline.push({$match: query.to_query()});
    return {
        project: self.project, limit: self.limit
      , skip: self.skip, run: self.run
      , unwind:self.unwind, sort: self.sort
      , geoNear:self.geoNear, group: self.group
    }
  }

  this.limit = function(limit) {
    pipeline.push({$limit: limit});
    options.limit = limit;

    return {
        project: self.project, filter: self.filter
      , skip: self.skip, run: self.run
      , unwind:self.unwind, sort: self.sort
      , geoNear:self.geoNear, group: self.group
    }
  }

  this.skip = function(skip) {
    pipeline.push({$skip: skip});
    options.skip = skip;

    return {
        project: self.project, filter: self.filter
      , limit: self.limit, run: self.run
      , unwind:self.unwind, sort: self.sort
      , geoNear:self.geoNear, group: self.group
    }
  }

  this.sort = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    // Contain final merged sort spec
    var sort = {};
    // Iterate over all arguments and generate
    // unified sort object
    for(var i = 0; i < args.length; i++) {
      for(var name in args[i]) {
        sort[name] = args[i][name];
      }
    }

    // Save sort order for pipeline or find
    pipeline.push({$sort: sort});
    options.sort = sort;

    // Return the possible chaining options
    return {
        project: self.project, filter: self.filter
      , limit: self.limit, skip: self.skip, run: self.run
      , unwind:self.unwind, geoNear:self.geoNear, group: self.group
    }
  }

  this.geoNear = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    asAggregation = true;

    return {
        project: self.project, filter: self.filter
      , limit: self.limit, skip: self.skip, run: self.run
      , unwind:self.unwind, sort: self.sort, group: self.group
    }
  }

  this.group = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    asAggregation = true;
    // Generate the sort value
    var group = {};
    // Iterate over all items
    for(var i = 0; i < args.length; i++) {
      var arg = args[i];

      if(arg.b) {
        group._id = arg.b;
      } else if(arg.c) {
        for(var name in arg.c) {
          group[name] = arg.c[name];
        }
      }
    }

    // Push the group command to the pipeline
    pipeline.push({$group: group});

    // Return possible options
    return {
        project: self.project, filter: self.filter
      , limit: self.limit, skip: self.skip, run: self.run
      , sort: self.sort, geoNear:self.geoNear, unwind: self.unwind
    }
  } 

  this.unwind = function(field) {
    asAggregation = true;
    pipeline.push({$unwind: '$' + field});    
    return {
        project: self.project, filter: self.filter
      , limit: self.limit, skip: self.skip, run: self.run
      , sort: self.sort, geoNear:self.geoNear, group: self.group
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
    // Push the projection
    pipeline.push({$project: projection});
    // Return the possible methods
    return {
        run: self.run, filter: self.filter
      , limit: self.limit, skip: self.skip
      , unwind:self.unwind, sort: self.sort
      , geoNear:self.geoNear, group: self.group
    }
  }

  this.to_query = function() {
    return query;
  }
}

exports.Matcher = Matcher;