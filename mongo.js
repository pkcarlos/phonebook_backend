const mongoose = require('mongoose');

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://pkcarlos:${password}@cluster0.wflge.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Contact = mongoose.model('Contact', contactSchema)

const contact = new Contact({ name, number })

Contact.find({}).then(result => {
  console.log('phonebook:')
  for (let i = 0; i < result.length; i ++) {
    console.log(result[i].name, result[i].number)
  }
  mongoose.connection.close()
})
