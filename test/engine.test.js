const path = require('path');
const assert = require('assert');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';
require('dotenv').config({path: path.join(__dirname, '.env')});

const {
  doneMessage,
  appInstance,
  supertest
} = require('@drifted/qa');

var engine = require(path.join(__dirname, '..'));

describe('engine', function() {

  var app = appInstance({render: false, csrf: true})

  app.response.render = engine({
    ext: 'html',
    views: [
      path.join(__dirname, 'views'),
      path.join(__dirname, 'alt')
    ],
    stream: true
  });

  app.get('/', function(req, res) {
    res.render('index.html');
  })

  app.get('/alt', function(req, res) {
    res.render('alt.html');
  })

  it('should show views', function(done) {
    supertest(app)
      .get('/')
      .end(function(err, res) {
        if (err) throw err;
        assert.equal(res.text.trim(), 'views');
        
        done();
      });
  })

  it('should show alt', function(done) {
    supertest(app)
      .get('/alt')
      .end(function(err, res) {
        if (err) throw err;
        assert.equal(res.text.trim(), 'alt');
        
        done();
      });
  })
})
