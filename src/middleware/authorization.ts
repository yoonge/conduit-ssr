import { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'

import DEFAULT from '../config/default.js'

export default async (ctx: Context, next: Next) => {
  try {

    const token = ctx.cookies.get('token')
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token as string, DEFAULT.JWT_SECRET, (err, decoded) => {
        if (err) reject(err)
        resolve(decoded)
      })
    })
    // console.log('decoded', decoded)
    const { cuid } = decoded as jwt.JwtPayload
    ctx.state.cuid = cuid
    await next()

  } catch (err) {

    console.error('err', err)
    if (err instanceof jwt.TokenExpiredError) {
      ctx.cookies.set('cuid', null)
      ctx.cookies.set('token', null)
    }
    ctx.status = 401
    await ctx.render('error', {
      err: {
        stack: JSON.stringify(err),
        status: 401
      },
      msg: 'Unauthorized.'
    })

  }
}
