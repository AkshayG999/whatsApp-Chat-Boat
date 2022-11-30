const mongoose = require('mongoose')

const WhatsAppSchema = new mongoose.Schema({
    mobileNumber: String,
    cityReply: [Object],
    locationReply: [Object]
})
const WhatsAppSession = mongoose.model('whatsapp', WhatsAppSchema)

module.exports = WhatsAppSession