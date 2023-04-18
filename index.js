"use strict";

const token = process.env.WHATSAPP_TOKEN;

const request = require("request"),
    express = require("express"),
    body_parser = require("body-parser"),
    axios = require("axios").default,
    app = express().use(body_parser.json());
require('dotenv').config()
require('./db');

const WhatsAppSession = require('./whatsAppSchema')
const { cityList, locality, getUser } = require('./AxiosCall');


app.listen(process.env.PORT || 3004, () => console.log("webhook is listening"));

app.get('/', (req, res) => {
    res.send("get server")
})

const sendMessageTemplate = (templateName, from, component) => {

    if (component == undefined) {
        return axios.post(`https://graph.facebook.com/v16.0/${process.env.WHATSAPP_PHONEID}/messages`,

            {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: from,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: 'en'
                    },
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            })
    } else {
        return axios.post(`https://graph.facebook.com/v16.0/${process.env.WHATSAPP_PHONEID}/messages`,

            {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: from,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: 'en'
                    },
                    components: component
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            })
    }
}

const listMessageSend = (messageObject) => {
    axios.post(
        `https://graph.facebook.com/v16.0/${process.env.WHATSAPP_PHONEID}/messages`,
        messageObject,
        {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            },
        }
    )
        .then(function (res) {
            // console.log(response.data);
            return (res.response)
        })
        .catch(function (error) {
            console.log("server error", error.response);
            // return res.status(500).send({ status: false, message: "server error" })
        });
}

app.post("/webhook", async (req, res) => {

    try {

        const { entry, object } = req.body
        console.log(JSON.stringify(req.body, null, 2));

        if (object && entry[0]) {

            const { changes } = entry[0]
            const { value } = changes[0]
            const { messages } = value  //msg Object 



            let cities = await cityList()
            let row = cities.data.map((city, index) => {
                return ({ id: city._id + '', title: city.name })
            })


            if (entry && entry[0] && changes && changes[0] && value && messages && messages[0].text) {
                console.log(messages[0])

                const { text } = messages[0]
                let phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
                let from = req.body.entry[0].changes[0].value.messages[0].from; //clien_Number

                let msg_body = text.body;
                console.log(msg_body)

                if (msg_body.trim().toLowerCase() == 'test' || msg_body.trim().toLowerCase() == 'hello') {

                  

                    //welcome Message send
                    sendMessageTemplate('welcome', from)
                        .then(async function (response) {
                            res.response1 = response
                            // City List map

                            let row = cities.data.map((city, index) => {
                                return ({ id: city._id + '', title: city.name })
                            })

                            const desiredOrder = ['5a66ffb063954132dfc0d568', '638f624843b8c905460a0ef1', '63c2d37f5b14bb50e58b14aa', '5ef0db450b21001b0911a129', '5ef399cb17b98b6b50426cf1', '5efb383217b98b6b50426dfc', '5cf1134946bae666ea47bfd3', '5c24db5e0d3df820ceb7ddcf', '5f292dbd21edb12e946534de', '5ef772ce17b98b6b50426dc9', '5ef39a9017b98b6b50426cf2', '5ef7744017b98b6b50426dcd', '5ef6e08917b98b6b50426da7', '63a2011b1461fb218a65882b', '63a2014b60b4805bbffebdb5'];
                            row = row.sort((a, b) => desiredOrder.indexOf(a.id) - desiredOrder.indexOf(b.id));

                            let listNumber = 1
                            for (let i = 0; i < row.length;) {

                                const listInteractiveObject = {
                                    type: "list",

                                    body: {
                                        text: "To start, please select your City :",
                                    },
                                    action: {
                                        button: "City List No - " + listNumber,
                                        sections: [
                                            {
                                                title: 'Choose Your City',
                                                rows: row.slice(i, i + 10)
                                            },
                                        ],
                                    },

                                };

                                let messageObject = {
                                    messaging_product: "whatsapp",
                                    recipient_type: "individual",
                                    to: from,
                                    type: "interactive",
                                    interactive: listInteractiveObject,
                                };
                                setTimeout(() => listMessageSend(messageObject), listNumber * 1000);
                                // City List message 

                                i = i + 10
                                listNumber++
                                if (i >= row.length) {
                                    i = row.length
                                }
                            }

                            //     row.splice(9, 0, { id: "10", title: "More" })
                            // console.log(row)

                            // const listInteractiveObject = {
                            //     type: "list",
                            //     header: {
                            //         type: "text",
                            //         text: "To Start with Please select your city",
                            //     },
                            //     body: {
                            //         text: "City Dropdown to be provided",
                            //     },
                            //     action: {
                            //         button: "City List",
                            //         sections: [
                            //             {
                            //                 title: 'Choose Your City',
                            //                 rows: row.slice(0, 10)
                            //             },
                            //         ],
                            //     },

                            // };

                            // let messageObject = {
                            //     messaging_product: "whatsapp",
                            //     recipient_type: "individual",
                            //     to: from,
                            //     type: "interactive",
                            //     interactive: listInteractiveObject,
                            // };

                            // listMessageSend(messageObject) // City List message 

                            return res.status(200).send({ status: true, message: "success" })

                        }).catch(function (err) {
                            console.log(err.response)
                            return res.status(500).send({ status: false, message: err.message })
                        })
                }

                // Interactive Reply Conditions
            } else if (entry && entry[0] && changes && changes[0] && value && messages && messages[0].interactive) {

                const { interactive, from } = messages[0]
                console.log(interactive)

                // if (interactive.list_reply.title == "More") {

                //     // City List map

                //     // row.splice(19, 0, { id: "19", title: "More" })

                //     console.log(row)

                //     const listInteractiveObject = {
                //         type: "list",
                //         header: {
                //             type: "text",
                //             text: "To Start with Please select your city",
                //         },
                //         body: {
                //             text: "City Dropdown to be provided",
                //         },
                //         action: {
                //             button: "City List",
                //             sections: [
                //                 {
                //                     title: 'Choose Your City',
                //                     rows: row.slice(9, 19)
                //                 },
                //             ],
                //         },

                //     };

                //     let messageObject = {
                //         messaging_product: "whatsapp",
                //         recipient_type: "individual",
                //         to: from,
                //         type: "interactive",
                //         interactive: listInteractiveObject,
                //     };

                //     listMessageSend(messageObject) // City List message 

                //     //user select city with Reply for locations
                // } else

                if (row.some((city) => city.title == interactive.list_reply.title)) {
                    console.log("user select city to get location= ", interactive.list_reply.title)

                    const findUser = await WhatsAppSession.findOne({ mobileNumber: from })

                    let city = {
                        id: interactive.list_reply.id,
                        title: interactive.list_reply.title
                    }
                    if (!findUser) {
                        const createUser = await WhatsAppSession.create({ mobileNumber: from, cityReply: [city] })
                        // console.log(createUser)
                    } else {
                        const update = await WhatsAppSession.findOneAndUpdate({ mobileNumber: from }, { cityReply: [city] }, { new: true })
                        // console.log(update)
                    }

                    const localityList = await locality(interactive.list_reply.id)

                    let row = localityList.data.map((location, index) => {

                        if (location.name.length >= 25) {
                            return ({ id: `${index} ${location._id}`, title: location.name.slice(0, 24), description: location.name })
                        } else {
                            return ({ id: `${index} ${location._id}`, title: location.name, description: location.name })
                        }
                    })
                    console.log(row)
                    let listNumber = 1;
                    for (let i = 0; i < row.length;) {

                        const listInteractiveObject = {
                            type: "list",
                            
                            body: {
                                text: "Please select your Location :",
                            },
                            action: {
                                button: "Location List - " + listNumber,
                                sections: [
                                    {
                                        title: 'Choose Your Location',
                                        rows: row.slice(i, i + 10)
                                    },
                                ],
                            },

                        };

                        let messageObject = {
                            messaging_product: "whatsapp",
                            recipient_type: "individual",
                            to: from,
                            type: "interactive",
                            interactive: listInteractiveObject,
                        };

                        setTimeout(() => listMessageSend(messageObject), listNumber * 1000);

                        i = i + 10
                        listNumber++
                        if (i >= row.length) {
                            i = row.length
                        }

                    }

                    // if (row.length > 10) {
                    //     row.splice(9, 0, { id: interactive.list_reply.id, title: "More Location", description: interactive.list_reply.title })
                    // }

                    // console.log(row)

                    // const listInteractiveObject = {
                    //     type: "list",
                    //     header: {
                    //         type: "text",
                    //         text: "Please select your location",
                    //     },
                    //     body: {
                    //         text: "Nearest location Dropdown",
                    //     },
                    //     action: {
                    //         button: "Location List",
                    //         sections: [
                    //             {
                    //                 title: 'Choose Your Location',
                    //                 rows: row.slice(0, 10)
                    //             },
                    //         ],
                    //     },

                    // };

                    // let messageObject = {
                    //     messaging_product: "whatsapp",
                    //     recipient_type: "individual",
                    //     to: from,
                    //     type: "interactive",
                    //     interactive: listInteractiveObject,
                    // };

                    // listMessageSend(messageObject)

                } else if (interactive.list_reply.id.split(' ')[0] >= 0 && interactive.list_reply.id.split(' ')[0] <= 50) {

                    console.log("Location choose by User " + interactive.list_reply.id)

                    let location = {
                        id: interactive.list_reply.id.split(' ')[1],
                        title: interactive.list_reply.title,
                    }

                    const update = await WhatsAppSession.findOneAndUpdate({ mobileNumber: from }, { locationReply: [location] }, { new: true })

                    // User Register or Not check
                    const userCheck = await getUser(from.slice(2, 12))
                    console.log(userCheck)

                    if (userCheck.data.length > 0) {

                        sendMessageTemplate('welcome_buttons_with_booking', from)
                            .then((res) => { return (res.response) })

                    } else {

                        sendMessageTemplate('welcome_buttons_without_mybooking', from)
                    }

                } else if (interactive.list_reply.title == 'Booking Procedure') {

                    sendMessageTemplate('booking_procedure_steps', from)

                } else if (interactive.list_reply.title == 'Rescheduling/Booking') {

                    sendMessageTemplate('rescheduling_policy', from)

                } else if (interactive.list_reply.title == 'Cancellation/Refund') {

                    sendMessageTemplate('cancellation_policy', from)

                } else if (interactive.list_reply.title == 'Fuel Policy') {

                    sendMessageTemplate('fuel_policy', from)

                }

                //>>>>>>>>>>BUTTON>>>>>>>>>>>>>>>>>>>
            } else if (entry && entry[0] && changes && changes[0] && value && messages && messages[0].button) {
                console.log(messages[0])
                const { from, button } = messages[0]

                if (button.payload == 'Book a Bike') {

                    const userCheck = await getUser(from.slice(2, 12))
                    if (userCheck) {

                        sendMessageTemplate("button_book_now_more_query_noname", from)

                    } else {

                        sendMessageTemplate("button_book_now_more_query_noname", from)
                    }


                } else if (button.payload == 'Book Now?') {

                    const userChatData = await WhatsAppSession.find({ mobileNumber: from })
                    const cityName = userChatData[0].cityReply[0].title.replace(/"/g, '');
                    const locationName = userChatData[0].locationReply[0].title.replace(/ /g, '-')

                    const url =`/${cityName}/any/any/${locationName}/1681806600000/1681828200000/Asia/Calcutta`
                    // console.log(url)

                    const component = [
                        {
                            "type": "button",
                            "sub_type": "url",
                            "index": "0",
                            "parameters": [
                                {
                                    "type": "text",
                                    "text": url
                                }
                            ]
                        },
                    ];


                    sendMessageTemplate("redirect_link_web_app", from, component)

                } else if (button.payload == 'My Bookings') {

                    console.log(button.payload, "from ", from)


                } else if (button.payload == 'Any Other Queries (FAQ)' || button.payload == 'Have more Queries?') {

                    sendMessageTemplate("any_other_query_faq", from)

                } else if (button.payload == 'Payment') {

                    sendMessageTemplate("how_do_make_payment", from)

                } else if (button.payload == 'How do I make Payments?') {

                    sendMessageTemplate("payment_acceptance", from)

                } else if (button.payload == 'Booking') {

                    const listInteractiveObject = {
                        type: "list",
                        body: {
                            text: "Please choose an option",
                        },
                        action: {
                            button: "Drop Down List",
                            sections: [
                                {
                                    title: "Choose Option",
                                    rows: [
                                        {
                                            id: "101",
                                            title: "Booking Procedure",

                                        },
                                        {
                                            id: "102",
                                            title: "Rescheduling/Booking",
                                            description: "extension policy"

                                        },
                                        {
                                            id: "103",
                                            title: "Cancellation/Refund",
                                            description: "policy"

                                        },
                                        {
                                            id: "104",
                                            title: "Fuel Policy",

                                        },
                                    ],
                                },
                            ],
                        }
                    }

                    let messageObject = {
                        messaging_product: "whatsapp",
                        recipient_type: "individual",
                        to: from,
                        type: "interactive",
                        interactive: listInteractiveObject,
                    };

                    listMessageSend(messageObject) // Booking Query list 

                } else if (button.payload == 'Damage') {

                    sendMessageTemplate("damage_query__buttos", from)

                } else if (button.payload == 'Accident/Physical Damage') {

                    const component = [
                        {
                            "type": "body",
                            "parameters": [
                                {
                                    "type": "text",
                                    "text": "123456789"
                                },
                            ]
                        }
                    ]

                    sendMessageTemplate("accidental_physical_damage", from, component)

                } else if (button.payload == 'Bike Break down') {

                    const component = [
                        {
                            "type": "body",
                            "parameters": [
                                {
                                    "type": "text",
                                    "text": "12345678"
                                },
                            ]
                        }
                    ]

                    sendMessageTemplate("bike_break_down", from, component)

                } else if (button.payload == 'Puncture Related issues') {

                    sendMessageTemplate("puncture_related_issues", from)
                }
            }

        } else {
            console.log("req body absent")
            res.sendStatus(404);
        }

    } catch (err) {
        console.log("server Error try", err)
        return res.status(500).send({ status: false, message: err.message })
    }
});



// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
app.get("/webhook", (req, res) => {

    const verify_token = process.env.VERIFY_TOKEN;

    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {

        if (mode === "subscribe" && token === verify_token) {

            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {

            res.sendStatus(403);
        }
    }
});

