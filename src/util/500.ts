import { Context } from 'koa'

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
