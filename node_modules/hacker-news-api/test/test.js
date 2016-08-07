var hn = require("./../index.js");
var fs = require('fs');
var expect = require('chai').expect;
var nock = require('nock');

hn.hitsPerPage(1);
var fixtures = JSON.parse(fs.readFileSync(__dirname + "/fixtures/fixtures.json"));

var api = nock('https://hn.algolia.com').persist();
fixtures.forEach(function(f) {
  api.get(f.url).reply(200, f.reply);
});


var slice = function(arr){ return Array.prototype.slice.call(arr); };

function crazy_curry(args, fn) {
  args = slice(arguments);
  fn = args.pop();

  return function(innerArgs) {
    innerArgs = slice(arguments);
    Array.prototype.push.apply(innerArgs, args);
    fn.apply(this, innerArgs);
  };
}



describe('hn', function(){
  function verifyDataHasOneOfTags(err, data, tags, done) {
    if(err) {
      return done("Error");
    }
    expect(data).to.have.property('hits');
    data.hits.forEach(function(comment) {
      var intersection = tags.filter(function(n) {
        return comment._tags.indexOf(n) != -1;
      });
      expect(intersection).not.to.be.empty;
    });
    done();
  }

  function verifyDataHasAllOfTags(err, data, tags, done) {
    if(err) {
      return done("Error");
    }
    expect(data).to.have.property('hits');
    data.hits.forEach(function(item) {
      tags.forEach(function(tag) {
        expect(item._tags).to.contain(tag);
      });
    });
    done();
  }

  it('should get comments', function(done) {
    hn.comment().top(crazy_curry(['comment'], done, verifyDataHasOneOfTags));
  });
  it('should get latest comments', function(done) {
    hn.comment().recent(crazy_curry(['comment'], done, verifyDataHasOneOfTags));
  });


  it('should get polls', function(done) {
    hn.poll().top(crazy_curry(['poll'], done, verifyDataHasOneOfTags));
  });
  it('should get latest polls', function(done) {
    hn.poll().recent(crazy_curry(['poll'], done, verifyDataHasOneOfTags));
  });


  it('should get posts', function(done) {
    hn.story().poll().top(crazy_curry(['story', 'poll'], done, verifyDataHasOneOfTags));
  });
  it('should get latest posts', function(done) {
    hn.story().poll().recent(crazy_curry(['story', 'poll'], done, verifyDataHasOneOfTags));
  });


  it('should get stories', function(done) {
    hn.story().top(crazy_curry(['story'], done, verifyDataHasOneOfTags));
  });
  it('should get latest stories', function(done) {
    hn.story().recent(crazy_curry(['story'], done, verifyDataHasOneOfTags));
  });

  it('should get item', function(done) {
    hn.item(17, function(err, res) {
      if(err) return done(err);
      expect(res.id).to.equal(17);
      expect(res.type).to.equal('comment');
      done();
    });
  });

  it('should get user', function(done) {
    hn.user('pg', function(err, res) {
      if(err) return done(err);
      expect(res.username).to.equal('pg');
      done();
    });
  });

  it('should get user comments', function(done) {
    hn.comment().author('pg').top(crazy_curry(['comment','author_pg'], done, verifyDataHasAllOfTags));
  });
  it('should get last user comments', function(done) {
    hn.comment().author('pg').recent(crazy_curry(['comment','author_pg'], done, verifyDataHasAllOfTags));
  });

  it('should get user polls', function(done) {
    hn.poll().author('pg').top(crazy_curry(['poll','author_pg'], done, verifyDataHasAllOfTags));
  });
  it('should get last user polls', function(done) {
    hn.poll().author('pg').recent(crazy_curry(['poll','author_pg'], done, verifyDataHasAllOfTags));
  });

  it('should get user stories', function(done) {
    hn.story().author('pg').top(crazy_curry(['story','author_pg'], done, verifyDataHasAllOfTags));
  });
  it('should get last user stories', function(done) {
    hn.story().author('pg').recent(crazy_curry(['story','author_pg'], done, verifyDataHasAllOfTags));
  });

  it('should search comments', function(done) {
    hn.comment().top().search('apple', crazy_curry(['comment'], done, verifyDataHasAllOfTags));
  });
  it('should search last comments', function(done) {
    hn.comment().recent().search('apple', crazy_curry(['comment'], done, verifyDataHasAllOfTags));
  });

  it('should search polls', function(done) {
    hn.poll().top().search('apple', crazy_curry(['poll'], done, verifyDataHasAllOfTags));
  });
  it('should search last polls', function(done) {
    hn.poll().recent().search('apple', crazy_curry(['poll'], done, verifyDataHasAllOfTags));
  });

  it('should search', function(done) {
    hn.ask_hn().page(2).search('apple', crazy_curry(['ask_hn'], done, verifyDataHasAllOfTags));
  });
  it('should search last', function(done) {
    hn.ask_hn().page(2).recent().search('apple', crazy_curry(['ask_hn'], done, verifyDataHasAllOfTags));
  });
});
