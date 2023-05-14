import Koa from 'koa'
const app = new Koa()

import path, { dirname } from 'node:path'
import url, { fileURLToPath } from 'node:url'

import bodyparser from 'koa-bodyparser'
import json from 'koa-json'
import koaStatic from 'koa-static'
import logger from 'koa-logger'
// @ts-ignore
import onerror from 'koa-onerror'
// @ts-ignore
import render from 'koa-art-template'

import index from './routes/index.js'
import user from './routes/user.js'

const _dirName = dirname(fileURLToPath(import.meta.url))

// error handler
onerror(app)

// middlewares
app
  .use(
    bodyparser({
      enableTypes: ['json', 'form', 'text']
    })
  )
  .use(json())
  .use(logger())
  .use(koaStatic(path.resolve(_dirName, '../public')))

// set templates global variable
app.use(async (ctx, next) => {
  const { pathname } = url.parse(ctx.request.url)
  ctx.state.pathname = pathname
  await next()
})

// render the template
render(app, {
  root: path.resolve(_dirName, 'views'),
  extname: '.html',
  debug: process.env.NODE_ENV !== 'production'
})

// logger
app.use(async (ctx, next) => {
  const start = Number(new Date())
  await next()
  const ms = Number(new Date()) - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes()).use(index.allowedMethods()).use(user.routes()).use(user.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

export default app
