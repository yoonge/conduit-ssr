import { Context } from 'koa'

export const response401 = (err: Error, ctx: Context) => {
  ctx.status = 401
  ctx.body = {
    code: 401,
    msg: err?.message || 'Unauthorized.'
  }
}

export const response500 = (err: Error, ctx: Context) => {
  ctx.status = 500
  ctx.body = {
    code: 500,
    msg: err?.message || 'Internal Server Error.',
  }
}

export default async (err: Error, ctx: Context) => {
  ctx.status = 500
  await ctx.render('error', {
    err: {
      stack: JSON.stringify(err),
      status: 500
    },
    msg: err?.message || 'Internal Server Error.'
  })
}
