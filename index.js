const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('./database.json')
const middlewares = jsonServer.defaults()

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
    res.jsonp(req.query)
})

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
    // Continue to JSON Server router
    next()
})

// Use default router
server.use('/api', router)

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log('JSON Server is running')
})