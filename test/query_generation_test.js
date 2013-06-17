var MongoQr = require('./..').MongoQr;

/**
 * Retrieve the server information for the current
 * instance of the db client
 *
 * @ignore
 */
exports.setUp = function(callback) {
  callback();
}

/**
 * Retrieve the server information for the current
 * instance of the db client
 *
 * @ignore
 */
exports.tearDown = function(callback) {
  callback();
}

exports['Should correctly connect'] = function(test) {
  var mongoqr = new MongoQr('mongodb://localhost:27017/mongoqr');
  mongoqr.connect(function(err, mongoqr) {
    test.equal(null, err);
    mongoqr.close();
    test.done();
  });
}

exports["mongoqr.db('mongoqr_2').collection('test') + each"] = function(test) {
  var mongoqr = new MongoQr('mongodb://localhost:27017/mongoqr');
  mongoqr.connect(function(err, mongoqr) {
    
    var cursor = mongoqr.db('mongoqr_2').collection('test_1').run();
    
    cursor.each(function(err, row) {
    }, function() {
      mongoqr.close();
      test.done();      
    });
  });
}

exports["mongoqr.db('mongoqr_2').collection('test') + toArray"] = function(test) {
  var mongoqr = new MongoQr('mongodb://localhost:27017/mongoqr');
  mongoqr.connect(function(err, mongoqr) {
    
    var cursor = mongoqr.db('mongoqr_2').collection('test_2').run();
    
    cursor.toArray(function(err, rows) {
      test.equal(null, err);
      test.deepEqual([], rows);
      mongoqr.close();
      test.done();
    });
  });
}

exports["mongoqr.db('mongoqr_2').collection('test') + next"] = function(test) {
  var mongoqr = new MongoQr('mongodb://localhost:27017/mongoqr');
  mongoqr.connect(function(err, mongoqr) {
    
    var cursor = mongoqr.db('mongoqr_2').collection('test_3').run();
    
    cursor.next(function(err, row) {
      test.equal(false, cursor.hasNext());
      test.equal(null, err);
      test.equal(null, row);
      mongoqr.close();
      test.done();
    });
  });
}

exports["mongoqr.db('mongoqr_2').collection('test_4').insert()"] = function(test) {
  var mongoqr = new MongoQr('mongodb://localhost:27017/mongoqr');
  mongoqr.connect(function(err, mongoqr) {
    
    // Delete the doc
    mongoqr.db('mongoqr_2')
      .collection('test_4')
      .get(1).delete({w:1}).run(function(err, result) {
        test.ok(result.deleted >= 0);
    
        // Insert a document
        mongoqr.db('mongoqr_2')
          .collection('test_4')
          .insert({_id: 1}).run(function(err, result) {
            test.equal(1, result.inserted);
            test.deepEqual([], result.generated_keys);

            // Get the doc with the unique id
            var cursor = mongoqr.db('mongoqr_2')
              .collection('test_4')
              .get(1).run();
            
            // Get the doc
            cursor.next(function(err, row) {
              test.equal(false, cursor.hasNext());
              test.equal(null, err);
              test.equal(1, row._id);
              mongoqr.close();
              test.done();
            });
          });    
      });
  });
}

exports["mongoqr.db('mongoqr_2').collection('test_4').insert() with upsert"] = function(test) {
  var mongoqr = new MongoQr('mongodb://localhost:27017/mongoqr');
  mongoqr.connect(function(err, mongoqr) {
    
    // Delete the doc
    mongoqr.db('mongoqr_2')
      .collection('test_5')
      .get(1).delete({w:1}).run(function(err, result) {
        test.ok(result.deleted >= 0);
    
        // Insert a document
        mongoqr.db('mongoqr_2')
          .collection('test_5')
          .insert({_id: 1}, {upsert:true}).run(function(err, result) {
            test.equal(1, result.inserted);
            test.deepEqual([], result.generated_keys);

            // Get the doc with the unique id
            var cursor = mongoqr.db('mongoqr_2')
              .collection('test_5')
              .get(1).run();
            
            // Get the doc
            cursor.next(function(err, row) {
              test.equal(false, cursor.hasNext());
              test.equal(null, err);
              test.equal(1, row._id);
              mongoqr.close();
              test.done();
            });
          });    
      });
  });
}
