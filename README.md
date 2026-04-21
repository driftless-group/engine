# engine


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
