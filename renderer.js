const path = require('path');
var Handlebars = require('handlebars');
const fs = require('fs');
const crypto = require('crypto');

var cache = {};
var sources = {}
var templates = {}

let finder = require('@drifted/assets/finder');
const gather = require('@drifted/assets/gather');

module.exports = function renderer(options={}) {

  // this is meant to register all the templates in the app and 
  // then use the ones from the module that aren't already replaced 
  // from the app.

  Handlebars = options.partials.reduce((handlebars, dir) => {
    var files = gather(dir, {cwd: '/'});
    Object.keys(files).reduce((hbs, name) => {
      if (hbs.partials[name] == undefined) {
        hbs.registerPartial(name, files[name]);
      }
      return hbs;
    }, handlebars)

    return handlebars;
  }, Handlebars)


  // this is meant to gather the default helpers and then 
  // potentially overwrite or add functions in the app.
  // I hope to provide some ok defaults that can be overwritten.
  var helpers = require('@drifted/assets/helpers');

  if (fs.existsSync(path.join(process.cwd(), 'helpers.js'))) {
    var appHelpers = require(path.join(process.cwd(), 'helpers'));
    Object.assign(helpers, appHelpers);
  }

  Handlebars = Object.keys(helpers).reduce((handlebars, funcName) => {
    handlebars.registerHelper(funcName, helpers[funcName]);
    return handlebars;
  }, Handlebars);




  return function render(filename, locals={}, onRender) {

    var instanceVariables = {};

    // I think that app.locals aren't getting added in.  
    // not sure where to get those from.
    Object.assign(instanceVariables, this.locals, locals);
    
    if (cache[filename] == undefined || ['development', 'test'].indexOf(process.env.NODE_ENV)) {
      var config = {
        filename: filename
      }

      if (locals.layout != false) {
        if (locals.layout != undefined) {
          config.layout = finder(options.layouts, locals.layout);
        } else {
          config.layout = finder(options.layouts, options.defaultLayout);
        }
      }

      config.view = finder(options.views, filename);

      var pipeline = [], layout;

      if (locals.layout != false) {
        if (sources[config.layout[0]] == undefined) {
          layout = fs.readFileSync(config.layout[0]).toString();
          sources[config.layout[0]] = layout;
        } else {
          layout = sources[config.layout[0]];
        }
        pipeline = pipeline.concat(layout.split("{{body}}"));
      }


      if (sources[filename] == undefined) {
        if (fs.existsSync(config.view[0])) {
          sources[filename] = fs.readFileSync(config.view[0]).toString();
        } else {
          throw new Error('Missing template file. The file views/'+filename+" doesn't exist.")
        }
      }

      if (pipeline.length > 1 && sources[filename] != undefined) {
        pipeline.splice(1, 0, sources[filename]);
      } else if (pipeline.length == 0 && locals.layout == false) {
        pipeline.push(sources[filename]);
      }

      cache[filename] = pipeline.map((source) => {
        return Handlebars.compile(source);
      })
    } 

    templates[filename] = cache[filename].map((func) => { return func; });

    if (options.stream) {
      for (let fn of templates[filename]) {
        this.write(fn(instanceVariables));
      }
      this.end();
    } else {
      var compiled = templates[filename].reduce((parts, fn) => {
        parts.push(fn(instanceVariables));
        return parts;
      }, []);

      var html = compiled.join('\n')

      if (this.cache == true) {
        var etag = crypto.createHash('md5').update(html).digest('hex');
        this.set('Etag', etag);
        
        if (this.req.headers['if-none-match'] == etag) {
          this.status(304).end();
        } else {
          this.send(html);
        }
      } else {
        this.send(html);
      }
    }
  }

}

