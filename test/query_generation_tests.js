var MongoQr = require('./..').MongoQr;

/**
 * Retrieve the server information for the current
 * instance of the db client
 *
 * @ignore
 */
exports.setUp = function(callback) {
  var mongoqr = new MongoQr('mongodb://localhost:27017/mongoqr');
  mongoqr.connect(function(err, mongoqr) {
    mongoqr.db('mongoqr_2')
      .collection('test')
      .getAll().delete({w:1}).run(function(err, result) {
        mongoqr.close();
        callback();
      });
  });    
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
    
    var cursor = mongoqr.db('mongoqr_2').collection('test').run();
    
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
    
    var cursor = mongoqr.db('mongoqr_2').collection('test').run();
    
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
    
    var cursor = mongoqr.db('mongoqr_2').collection('test').run();
    
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
      .collection('test')
      .get(1).delete({w:1}).run(function(err, result) {
        test.ok(result.deleted >= 0);
    
        // Insert a document
        mongoqr.db('mongoqr_2')
          .collection('test')
          .insert({_id: 1}).run(function(err, result) {
            test.equal(1, result.inserted);
            test.deepEqual([], result.generated_keys);

            // Get the doc with the unique id
            var cursor = mongoqr.db('mongoqr_2')
              .collection('test')
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
        
    // Insert a document
    mongoqr.db('mongoqr_2')
      .collection('test')
      .insert({_id: 1}, {upsert:true}).run(function(err, result) {
        test.equal(1, result.inserted);
        test.deepEqual([], result.generated_keys);

        // Get the doc with the unique id
        var cursor = mongoqr.db('mongoqr_2')
          .collection('test')
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
}

exports["mongoqr.db('mongoqr_2').collection('test').getAll('a', 1).run()"] = function(test) {
  var mongoqr = new MongoQr('mongodb://localhost:27017/mongoqr');
  mongoqr.connect(function(err, mongoqr) {
    // Insert a document
    mongoqr.db('mongoqr_2')
      .collection('test')
      .insert([{_id: 1, a: 1}, {_id: 2, a: 1}]).run(function(err, result) {
        test.equal(2, result.inserted);
        test.deepEqual([], result.generated_keys);

        // Get the doc with the unique id
        var cursor = mongoqr.db('mongoqr_2')
          .collection('test')
          .getAll('a', 1).run();
        
        // Get the doc
        cursor.toArray(function(err, rows) {
          test.equal(false, cursor.hasNext());
          test.equal(null, err);
          test.equal(2, rows.length);
          mongoqr.close();
          test.done();
        });
      });    
  });
}

exports["mongoqr.db('mongoqr_2').collection('test').between(1, 2).run()"] = function(test) {
  var mongoqr = new MongoQr('mongodb://localhost:27017/mongoqr');
  mongoqr.connect(function(err, mongoqr) {
    // Insert a document
    mongoqr.db('mongoqr_2')
      .collection('test')
      .insert([{_id: 1, a: 1}, {_id: 2, a: 2}]).run(function(err, result) {
        test.equal(2, result.inserted);
        test.deepEqual([], result.generated_keys);

        // Get the doc with the unique id
        var cursor = mongoqr.db('mongoqr_2')
          .collection('test')
          .between(1, 1, 'a').run();
        
        // Get the doc
        cursor.toArray(function(err, rows) {
          test.equal(false, cursor.hasNext());
          test.equal(null, err);
          test.equal(1, rows.length);
          test.equal(1, rows[0].a);
          mongoqr.close();
          test.done();
        });
      });    
  });
}

exports["mongoqr.db('mongoqr_2').collection('test').filter({a:1}).run()"] = function(test) {
  var mongoqr = new MongoQr('mongodb://localhost:27017/mongoqr');
  mongoqr.connect(function(err, mongoqr) {
    // Insert a document
    mongoqr.db('mongoqr_2')
      .collection('test')
      .insert([{_id: 1, a: 1}, {_id: 2, a: 2}]).run(function(err, result) {
        test.equal(2, result.inserted);
        test.deepEqual([], result.generated_keys);

        // Get the doc with the unique id
        var cursor = mongoqr.db('mongoqr_2')
          .collection('test')
          .filter({a:1}).run();
        
        // Get the doc
        cursor.toArray(function(err, rows) {
          test.equal(false, cursor.hasNext());
          test.equal(null, err);
          test.equal(1, rows.length);
          test.equal(1, rows[0].a);
          mongoqr.close();
          test.done();
        });
      });    
  });
}
