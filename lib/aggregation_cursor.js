var AggregationCursor = function(collection, pipeline) {
  console.dir(pipeline)

  // Convert result to array
  this.toArray = function(callback) {
    collection.aggregate(pipeline, function(err, results) {
      if(err) return callback(err, null);
      callback(null, results);            
    });
  }
}

exports.AggregationCursor = AggregationCursor;