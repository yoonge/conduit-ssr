import md5 from 'md5'
import DEFAULT from '../config/default.js'

export default (str: string) => {
  return md5(md5(str) + DEFAULT.JWT_SECRET)
}
