# engine

Express middleware that allows you to use several paths to look for views.  So that you can have a repo that is shared between projects and reuse view code more easily.  Maybe this already exists somewhere but I don't know how to do it.

```bash
   npm install @drifted/engine --save
```

```javascript
  app.response.render = require('@drifted/engine')({
    views: [
      path.join(__dirname, 'views'),
      path.join(process.cwd(), 'node_modules', '@drifted', 'views')
    ],
    stream: true
  }); 

```
