const path = require('path');
const renderer = require(path.join(__dirname, 'renderer'));


function configure(opts={}) { 
  var options = {};

  if (options.verbose == undefined) {
    options.verbose = false;
  }

  if (options.ext == undefined) {
    options.ext = 'html';
  }

  var appDefaults = {
    views: [path.join(process.cwd(), "views")],
    layouts: 'layouts',
    partials: 'partials',
    defaultLayout: ['application', options.ext].join('.')
  }

  Object.assign(options, appDefaults, opts);
  
  var others = options.views.reduce((sets, viewDir) => {
    sets.layouts.push(path.join(viewDir, 'layouts'));
    sets.partials.push(path.join(viewDir, 'partials'));
    
    return sets;
  }, {layouts: [], partials: []});

  Object.assign(options, others);

  var render = renderer(options);

  return function(filename, locals={}, onRender) {
    render.call(this, filename, locals, onRender);
  } 

}

module.exports = configure;
