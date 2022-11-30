const axios = require('axios')
require('dotenv')

// Get City List 
const cityList = async () => {

    const list = await axios.get(process.env.CITY_LIST,
        {},
        {
            headers: {
                'Authorization': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY0Mjk2Y2M3YmFjMDI2NGNiOGFmMmM0NCIsInVzZXJuYW1lIjoibmlybWl0ZWUiLCJtb2JpbGVOdW1iZXIiOiI5ODgxNDI4MDA4IiwiZW1haWwiOiJiYWxld2FkaUBib29uZ2cuY29tIiwicm9sZSI6IlNUT1JFX0FETUlOIiwic3RhdHVzIjp0cnVlLCJmcmFuY2hpc2VUeXBlIjoiU0lMVkVSX0ZSQU5DSElTRSIsIl9fdiI6MH0sImlhdCI6MTY4MDg3MDUyMH0.1bBaySRuGMREcsd-0U04MjNnEuQ_EahYnSBsOBguqco",
            }
        }
    )
    return list
}

// Get Locations List By City Name
const locality = async (CityName) => {
    const list = await axios.get(`${process.env.LOCALITY_LIST}/${CityName}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY0Mjk2Y2M3YmFjMDI2NGNiOGFmMmM0NCIsInVzZXJuYW1lIjoibmlybWl0ZWUiLCJtb2JpbGVOdW1iZXIiOiI5ODgxNDI4MDA4IiwiZW1haWwiOiJiYWxld2FkaUBib29uZ2cuY29tIiwicm9sZSI6IlNUT1JFX0FETUlOIiwic3RhdHVzIjp0cnVlLCJmcmFuY2hpc2VUeXBlIjoiU0lMVkVSX0ZSQU5DSElTRSIsIl9fdiI6MH0sImlhdCI6MTY4MDg3MDUyMH0.1bBaySRuGMREcsd-0U04MjNnEuQ_EahYnSBsOBguqco`,
        {},
        {
            headers: {
                "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY0Mjk2Y2M3YmFjMDI2NGNiOGFmMmM0NCIsInVzZXJuYW1lIjoibmlybWl0ZWUiLCJtb2JpbGVOdW1iZXIiOiI5ODgxNDI4MDA4IiwiZW1haWwiOiJiYWxld2FkaUBib29uZ2cuY29tIiwicm9sZSI6IlNUT1JFX0FETUlOIiwic3RhdHVzIjp0cnVlLCJmcmFuY2hpc2VUeXBlIjoiU0lMVkVSX0ZSQU5DSElTRSIsIl9fdiI6MH0sImlhdCI6MTY4MDg3MDUyMH0.1bBaySRuGMREcsd-0U04MjNnEuQ_EahYnSBsOBguqco",

            }
        }
    )
    return list
}
// Get User By mobile Number
const getUser = async (mobileNumber) => {

    return await axios.get(`${process.env.GET_USER_BY_MOBILENUMBER}/${mobileNumber}`)

}


module.exports = { cityList, locality, getUser }



function whatsAppMessage(message) {
    axios.post(`https://graph.facebook.com/v16.0/${process.env.WHATSAPP_PHONEID}/messages`,

        {
            "messaging_product": "whatsapp",
            "to": 919503986891,
            "text": {
                "preview_url": true,
                "body": "Please visit https://docs.google.com/spreadsheets/d/1P9cjME1w4Z66eCLnPElBeBg_Cwfg3l9JNg43Rm0sfZA/edit#gid=236001880 to inspire your day!"
            }
        },

        {
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            return response;
        }).catch(function (err) {
            console.log(err)
            return err
        })
}
