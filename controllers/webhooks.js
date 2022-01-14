const { WebhookClient } = require('dialogflow-fulfillment');


const webhook = async(req, res = response) => {
    console.log('webhook ok');
    const agent = new WebhookClient({ request: req, response: res });

    console.log('webhook ok');


    // console.log(agent.action);
    // console.log(agent.contexts);
    // console.log(req.body);

    var data = req.body;

    const MIN_SEQUENCE_LENGTH = 10;

    function sendSSML(request, response, ssml) {
        ssml = `${ssml}`;

        response.json({
            fulfillmentText: ssml
        });
    }

    function sayHello2() {
        agent.add("Hola querido 2");
    }

    async function sayHello() {
        await sleep(1000);
        sendSSML(req, res, "Hola querido");
    }

    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }


    let intentMap = new Map();
    intentMap.set('saludo', sayHello);
    // intentMap.set('saludo', sayHello2);


    agent.handleRequest(intentMap);
}

module.exports = {
    webhook
}