const path = require('path');
const assert = require('assert');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';
require('dotenv').config({path: path.join(__dirname, '.env')});
const {City} = require(path.join(__dirname, 'city'));
require('@drifted/qa/db');

const {
  doneMessage
} = require('@drifted/qa');


describe('slug', function() {
  it('should create a slug', function(done) {
    var city = new City({name: 'New Orleans'});
    try {
    city.save().then(() => {
      assert.equal(city.slug, 'new-orleans')
      done();
    }).catch(doneMessage(done));
    } catch(error) {
      console.log(error);
      done();
    }
  })
})
