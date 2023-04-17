import mongoose from 'mongoose'

const dbConnection = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/test')
}

dbConnection()
  .then(() => console.log('Database connection succeeded.'))
  .catch(err => console.error(err))

export default mongoose
