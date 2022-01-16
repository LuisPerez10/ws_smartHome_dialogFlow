const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const { response } = require('express');


const webhook = async(req, res = response) => {
    console.log('webhook ok');
    const agent = new WebhookClient({ request: req, response: res });

    console.log("-------------------------------------------------");
    console.log("agent.agentVersion");
    console.log(agent.agentVersion);
    console.log("-------------------------------------------------");
    console.log("agent.intent");
    console.log(agent.intent);
    console.log("-------------------------------------------------");
    console.log("agent.action");
    console.log(agent.action);
    console.log("-------------------------------------------------");
    console.log("agent.parameters");
    console.log(agent.parameters);
    console.log("-------------------------------------------------");
    console.log("agent.contexts");
    console.log(agent.contexts);
    console.log("-------------------------------------------------");
    console.log("agent.requestSource");
    console.log(agent.requestSource);
    console.log("-------------------------------------------------");
    console.log("agent.originalRequest");
    console.log(agent.originalRequest);
    console.log("-------------------------------------------------");
    console.log("agent.query");
    console.log(agent.query);
    console.log("-------------------------------------------------");
    console.log("agent.locale");
    console.log(agent.locale);
    console.log("-------------------------------------------------");
    console.log("agent.session");
    console.log(agent.session);
    console.log("-------------------------------------------------");
    console.log("agent.consoleMessages");
    console.log(agent.consoleMessages);
    console.log("-------------------------------------------------");
    console.log("agent.alternativeQueryResults");
    console.log(agent.alternativeQueryResults);


    console.log(agent.agentVersion);
    console.log(agent.intent);
    console.log(agent.action);
    console.log(agent.contexts);
    console.log(agent.parameters);
    console.log(req.body);

    var data = req.body;

    const MIN_SEQUENCE_LENGTH = 10;



    function sendSSML(request, response, ssml) {
        ssml = `${ssml}`;

        response.json({
            fulfillmentText: ssml
        });
    }

    function fImperativa_TV_EA(req, res) {
        // obtener accion
        var accion = agent.action;
        // obtener parametros
        var params = agent.parameters;
        // analizar parametros
        analizarParametros(params);
        //preparar respuesta
        var data = prepararRespuesta(params);
        //enviar respuesta
        agent.add(new Payload(agent.UNSPECIFIED, data, { rawPayload: true, sendAsMessage: true }));
    }

    function sayHello2() {

        const fulldata = {
            data: "data",
            value: "Hola che"
        }
        agent.add("Saludo amigo");
        agent.add(new Payload(agent.UNSPECIFIED, fulldata, { rawPayload: true, sendAsMessage: true }));
    }

    // async function sayHello() {
    //     await sleep(1000);
    //     sendSSML(req, res, "Hola querido");
    // }

    // function sleep(ms) {
    //     return new Promise((resolve) => {
    //         setTimeout(resolve, ms);
    //     });
    // }


    let intentMap = new Map();
    intentMap.set('saludo', sayHello2);
    intentMap.set('Imperativa_TV_E/A', sayHello2);

    agent.handleRequest(intentMap);
}

function prepararRespuesta(a) {
    var cadena = "";
    var flow = new stateflow.StateFlow({
        begin: {
            type: 'begin',
            action: function(complete) {
                // do something
                switch ("_a") {
                    case "_a":
                        cadena = "_a";
                        complete("e_action");
                        break;
                    case "_b":
                        complete('done');
                        break;
                };

                console.log("begin");

            },
            on: {
                e_action: 'e_action',
                done: 'b',
                again: 'a'
            }
        },
        b: {
            type: 'end',
            action: function(complete) {
                console.log("end");
                complete('finished');
            }
        },
        e_action: {
            type: 'state',
            action: function(complete) {
                console.log("done");
                complete('done');
            },
            on: {
                done: 'b',
                again: 'a'
            }
        }
    });
    flow.start(function(event) {
        console.log('flow result:', event);
        console.log('flow result:', event);
        return res.send("Todo ok " + cadena);
    });
};


module.exports = {
    webhook
}