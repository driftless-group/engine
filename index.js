const path = require('path');
const renderer = require(path.join(__dirname, 'renderer'));


module.exports = function configure(opts={}) { 

  var options = {};

  if (options.ext == undefined) {
    options.ext = 'handlebars';
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
