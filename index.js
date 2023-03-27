const jwt = require('jsonwebtoken');
const jsonServer = require('json-server')
const auth = require('json-server-auth')

const JWT_SECRET_KEY = require('./node_modules/json-server-auth/dist/constants').JWT_SECRET_KEY;

const server = jsonServer.create()
const router = jsonServer.router('./database.json')

const middlewares = jsonServer.defaults()

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now()
  }
  // Continue to JSON Server router
  next()
})

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.jsonp(req.query)
})

server.get('/me', auth, (req, res, next) => {
  const token = req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : null;

  if (token) {
    try {
      const data = jwt.verify(token, JWT_SECRET_KEY)
      const { db } = req.app;
      const { id, email } = db.get('users').find({ email: data.email }).value();
      res.json({ id, email })
    } catch (error) {
      res.json({ error })
    }
  } else {
    res.json({ error: { message: 'User not authorized' } })
  }
});

// Bind the router db to the app
server.db = router.db

const rules = auth.rewriter({
  // Permission rules
  users: 600,
  'shared-movies': 664,
})

// You must apply the middlewares in the following order
server.use(rules)

server.use(auth)

// Use default router
server.use(router)

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('JSON Server is running')
})
