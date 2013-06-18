var AggregationCursor = function(collection, query, projection) {
  // Build pipeline
  var pipeline = [{$match: query}, {$project:projection}];
  // Convert result to array
  this.toArray = function(callback) {
    collection.aggregate(pipeline, function(err, results) {
      if(err) return callback(err, null);
      callback(null, results);            
    });
  }
}

exports.AggregationCursor = AggregationCursor;