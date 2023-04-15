import Koa from 'koa'
const app = new Koa()

import path, { dirname } from 'node:path'
import url, { fileURLToPath } from 'node:url'

import bodyparser from 'koa-bodyparser'
import json from 'koa-json'
import koaStatic from 'koa-static'
import logger from 'koa-logger'
import onerror from 'koa-onerror'
import render from 'koa-art-template'

import index from './routes/index.js'
import user from './routes/user.js'

const _dirName = dirname(fileURLToPath(import.meta.url))
console.log(_dirName)

// error handler
onerror(app)

// middlewares
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text']
  })
)
app.use(json())
app.use(logger())
app.use(koaStatic(_dirName + '/public'))

// set templates global variable
app.use(async (ctx, next) => {
  const { pathname } = url.parse(ctx.request.url)
  ctx.state.pathname = pathname
  await next()
})

// render the template
render(app, {
  root: path.join(_dirName, 'views'),
  extname: '.html',
  debug: process.env.NODE_ENV !== 'production'
})

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(user.routes(), user.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

export default app
