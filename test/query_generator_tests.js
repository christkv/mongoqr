var MongoQr = require('./..').MongoQr
  , PreCursor = require('../lib/pre_cursor').PreCursor
  , Q = MongoQr.Q;

// Bind and/or/etc
Q.bind(global);

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

exports['Should correctly start aggregation when using projection'] = function(test) {
  // // Find inclusive projection
  // var query = new PreCursor()
  //   .filter(or( 
  //       and(f('age').gte(10).lte(20), f('city').eq('london')),
  //       and(f('age').gte(10).lte(20), f('city').eq('oslo'))    
  //     ))
  //   .project(include("age", "city"));
  // // console.dir(query)

  // // Find exclusive projection
  // var query = new PreCursor()
  //   .filter(or( 
  //       and(f('age').gte(10).lte(20), f('city').eq('london')),
  //       and(f('age').gte(10).lte(20), f('city').eq('oslo'))    
  //     ))
  //   .project(exclude("age"));

  // // Aggregation transformation
  // var query = new PreCursor()
  //   .filter(or( 
  //       and(f('age').gte(10).lte(20), f('city').eq('london')),
  //       and(f('age').gte(10).lte(20), f('city').eq('oslo'))    
  //     ))
  //   .project(
  //       include('title')
  //     , create('age').from('oldest')
  //     , create('other.city').from('city2')
  //     , create('doctoredPageViews').from('pageViews').add(10)
  //   );
    // .project(
    //     include('title')
    //   , create('age').from('oldest')
    //   , create('other.city').from('city2')
    //   , create('doctoredPageViews').from('pageViews').add(10)
    // );

   // {
   //     title : 1 ,
   //     page_views : "$pageViews" ,
   //     bar : "$other.foo"
   // }

   //  p.include("title")
   //     .child("stats", p
   //       .add("pv", "$pageViews")
   //       .add("foo", "$other.foo"))
     // .add(stats
     //    , p.add('pv', "$pageViews").add('foo')
     // )

  // console.dir(query)

  // test.done();

  var mongoqr = new MongoQr('mongodb://localhost:27017/mongoqr');
  mongoqr.connect(function(err, mongoqr) {
    // Build a query
    mongoqr.db('mongoqr_2')
      .collection('test')
      .insert({age: 15, city: 'london'}).run(function(err, result) {
        test.equal(1, result.inserted);

        // Get a cursor
        var cursor = mongoqr.db('mongoqr_2')
          .collection('test')
          .filter(or( 
              and(f('age').gte(10).lte(20), f('city').eq('london')),
              and(f('age').gte(10).lte(20), f('city').eq('oslo'))    
            ))
          .project(
              include('city')
            , create('age').from('oldest')
            , create('other.city').from('city2')
            , create('doctoredPageViews').from('age').add(10)
          ).run();

        // Execute the toArray function
        cursor.toArray(function(err, docs) {
          test.equal(null, err);
          test.equal(25, docs[0].doctoredPageViews);
          test.equal('london', docs[0].city);
          mongoqr.close();
          test.done();
        });
    });
  });
}

exports['Should correctly update field'] = function(test) {
  // Get a cursor
  var query = new PreCursor()
    .filter(or( 
        and(f('age').gte(10).lte(20), f('city').eq('london')),
        and(f('age').gte(10).lte(20), f('city').eq('oslo'))    
      )).to_query();
  
  // Validate the correct query generated
  test.deepEqual({ '$or': 
    [ 
      { '$and': [{ age: { '$gte': 10, '$lte': 20 } }, { city: 'london' }] }, 
      { '$and': [{ age: { '$gte': 10, '$lte': 20 } }, { city: 'oslo' }] } 
    ] }, query);

  // Test done
  test.done();

  // var mongoqr = new MongoQr('mongodb://localhost:27017/mongoqr');
  // mongoqr.connect(function(err, mongoqr) {
  //   // Build a query
  //   mongoqr.db('mongoqr_2')
  //     .collection('test')
  //     .insert({age: 15, city: 'london'}).run(function(err, result) {
  //       test.equal(1, result.inserted);

  //       // Get a cursor
  //       var cursor = mongoqr.db('mongoqr_2')
  //         .collection('test')
  //         .filter(or( 
  //             and(f('age').gte(10).lte(20), f('city').eq('london')),
  //             and(f('age').gte(10).lte(20), f('city').eq('oslo'))    
  //           )).run();

  //       // Execute the toArray function
  //       cursor.toArray(function(err, docs) {
  //         test.equal(null, err);
  //         test.equal(15, docs[0].age);
  //         test.equal('london', docs[0].city);
  //         mongoqr.close();
  //         test.done();
  //       });
  //   });
  // });
}