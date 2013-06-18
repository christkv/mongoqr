var Cursor = require("./cursor").Cursor;

var Q = function(field) {
  if(!(this instanceof Q)) {
    return new Q(field);
  }

  // Default empty field
  var query = {};
  if(typeof field != 'string') {
    query = field;      
  }

  // Internal state variables
  var current_field = field;
  var self = this;

  // Functions
  this.gte = function(value) {
    if(!query[current_field]) query[current_field] = {};
    query[current_field]['$gte'] = value;
    return self;
  }

  this.lte = function(value) {
    if(!query[current_field]) query[current_field] = {};
    query[current_field]['$lte'] = value;
    return self;
  }

  this.eq = function(value) {
    if(!query[current_field]) query[current_field] = {};
    query[current_field] = value;
    return self;      
  }

  this.to_query = function() {
    return query;
  }

  return this;
}

Q.bind = function(self) {
  if(self.and) throw new Error("redefining and function not allowed");
  if(self.or) throw new Error("redefining or function not allowed");
  if(self.f) throw new Error("redefining f function not allowed");
  if(self.include) throw new Error("redefining include function not allowed");
  if(self.create) throw new Error("redefining create function not allowed");
  if(self.exclude) throw new Error("redefining exclude function not allowed");
  self.and = Q.and;
  self.include = Q.include;
  self.exclude = Q.exclude;
  self.or = Q.or;
  self.create = Q.create;
  self.f = Q;
}

Q.create = function(field) {
  var projection = {};

  // Return possible paths
  return {
    from: function(fromField) {
      projection[field] = '$' + fromField
      return {
        add: function(value) {
          projection[field] = {$add: ['$' + fromField, value]}
          return {c: projection};
        },
        
        query: function() {
          return {c: projection};          
        }
      }
    }
  }
}

Q.include = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  var projection = {};

  for(var i = 0; i < args.length; i++) {
    projection[args[i]] = 1;
  }
  
  return {i: projection};
}

Q.exclude = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  var projection = {};

  for(var i = 0; i < args.length; i++) {
    projection[args[i]] = 0;
  }
  
  return {e: projection};
}

Q.or = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  // Hold final query
  query = {$or: []};
  // Validate all entries
  for(var i = 0; i < args.length; i++) {
    if(!(args[i] instanceof Q)) throw new Error("All and expressions must be of type Q");
    query['$or'].push(args[i].to_query());
  }
  // Return a wrapped Q
  return Q(query);
}

Q.and = function() {    
  var args = Array.prototype.slice.call(arguments, 0);
  // Hold final query
  query = {$and: []};
  // Validate all entries
  for(var i = 0; i < args.length; i++) {
    if(!(args[i] instanceof Q)) throw new Error("All and expressions must be of type Q");
    query['$and'].push(args[i].to_query());
  }
  // Return a wrapped Q
  return Q(query);
}

exports.Q = Q;