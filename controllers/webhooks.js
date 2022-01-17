const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const { response } = require('express');
const stateflow = require('stateflow');
const { obtenerCanales, obtenerComandoTV } = require('../class/LGRF');
const { obtenerBrillo, obtenerTemp, obtenerColor } = require('../class/broadlink');



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

    async function fImperativa(req, res) {
        // obtener accion
        var accion = agent.action;
        // obtener parametros
        var params = agent.parameters;
        // analizar parametros
        // analizarParametros(params);
        //preparar respuesta
        var fulldata = await maquinaSuperlativa(params);
        console.log("fulldata");
        console.log(fulldata);
        var { mensaje, ...data } = fulldata;
        //enviar respuesta
        agent.add(mensaje);
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


    let intentMap = new Map();
    // intentMap.set('saludo', sayHello2);
    intentMap.set('t_encender', fImperativa);
    intentMap.set('t_apagar', fImperativa);
    intentMap.set('f_encender', fImperativa);
    intentMap.set('f_apagar', fImperativa);
    intentMap.set('f_color', fImperativa);
    intentMap.set('f_temp', fImperativa);
    intentMap.set('f_brillo', fImperativa);
    intentMap.set('t_canal', fImperativa); // canal+ canal-
    intentMap.set('t_volumen', fImperativa); // vol+  vol-
    intentMap.set('t_btn', fImperativa); //  presionar cualquier boton dl control
    intentMap.set('t_canal_num', fImperativa); // presionar cualquier numero
    // intentMap.set('tv_encender', maquinaSuperlativa);

    agent.handleRequest(intentMap);
}

function prepararRespuesta(params) {
    return maquinaSuperlativa(params);
};

const maquinaSuperlativa = async(params) => {
    console.log("entro");
    var data = {};

    var flow = new stateflow.StateFlow({
        begin: {
            type: 'begin',
            action: function(complete) {
                console.log("inicio");
                if (params.hasOwnProperty("t_foco") && params.t_foco != "") {
                    data.to = "t_foco";
                    complete("to");
                } else
                if (params.hasOwnProperty("t_tv") && params.t_tv != "") {
                    data.to = "t_tv";
                    complete("to");
                } else {
                    complete("error");
                }
            },
            on: {
                to: 'to',
                error: 'error'
            }
        },
        to: {
            type: 'state',
            action: function(complete) {
                console.log("to");

                var key = Object.keys(params).filter(v => /^a_/.test(v));
                if (key.length < 1) {
                    complete(error);
                } else {

                    if (params.hasOwnProperty("a_encender") && params.a_encender != "") {
                        var cdo = "";
                        if (params.hasOwnProperty("t_foco") && Boolean(params.t_foco)) {
                            cdo = "1";
                        } else {
                            cdo = obtenerComandoTV(params.a_encender);
                        }
                        data.action = "a_encender";
                        data.commands = [cdo];
                        complete("action_ea");
                    } else
                    if (params.hasOwnProperty("a_apagar") && params.a_apagar != "") {
                        var cdo = "";
                        if (params.hasOwnProperty("t_foco") && Boolean(params.t_foco)) {
                            cdo = "0";
                        } else {
                            cdo = obtenerComandoTV(params.a_apagar);
                        }
                        data.action = "a_apagar";
                        data.commands = [cdo];
                        complete("action_ea");
                    } else if (params.hasOwnProperty("a_poner") && params.a_poner != "") {
                        data.action = "a_poner";
                        complete("action_p");
                        // TODO
                    } else {
                        complete("error");
                    }
                }
            },
            on: {
                action_ea: 'action_ea',
                action_p: 'action_p',
                error: 'error'
            }
        },
        action_ea: {
            type: 'state',
            action: function(complete) {
                console.log("action_ea");
                complete("fin");

            },
            on: {
                commands: 'commands',
                error: 'error',
                fin: 'fin',
            }
        },
        action_p: {
            type: 'state',
            action: function(complete) {
                console.log("action_p");
                if (params.hasOwnProperty("at_brillo") && params.at_brillo != "") {
                    data.attrib = "at_brillo";
                    complete("commands");
                } else
                if (params.hasOwnProperty("at_canal") && params.at_canal != "") {
                    data.attrib = "at_canal";
                    complete("commands");
                } else
                if (params.hasOwnProperty("at_color") && params.at_color != "") {
                    data.attrib = "at_color";
                    complete("commands");
                } else
                if (params.hasOwnProperty("at_temperatura_color") && params.at_temperatura_color != "") {
                    data.attrib = "at_temperatura_color";
                    complete("commands");
                } else
                if (params.hasOwnProperty("at_volumen") && params.at_volumen != "") {
                    data.attrib = "at_volumen";
                    complete("commands");
                }
                //existe comandos? 
                var cdos = Object.keys(params).filter(v => /^c_/.test(v));
                //falta verificar si las keys son nulas sino tira error
                if (cdos.length < 1) {
                    complete("error");
                } else {
                    complete("commands");
                }
            },
            on: {
                commands: 'commands',
                error: 'error',
                fin: 'fin',
            }
        },
        commands: {
            type: 'state',
            action: function(complete) {
                console.log("commands");
                // var key = Object.keys(params).filter(v => /^c_/.test(v));
                if (params.hasOwnProperty("c_canal_num") && params.c_canal_num != "") {
                    var cdos = obtenerCanales(params.c_canal_num);
                    data.commands = [...cdos];
                    complete("fin");
                } else
                if (params.hasOwnProperty("c_control_btn") && params.c_control_btn != "") {
                    var cdo = obtenerComandoTV(params.c_control_btn);
                    data.commands = [cdo];
                    complete("fin");
                } else
                if (params.hasOwnProperty("c_subir") && params.c_subir != "") {
                    // bajar volumen o canal
                    var c_subir = params.hasOwnProperty("at_canal") ? "cbajar" : "vbajar"
                    var cdo = obtenerComandoTV(c_subir);
                    data.commands = [cdo];
                    complete("fin");
                } else
                if (params.hasOwnProperty("c_bajar") && params.c_bajar != "") {
                    // bajar volumen o canal

                    var c_bajar = params.hasOwnProperty("at_canal") ? "cbajar" : "vbajar"
                    var cdo = obtenerComandoTV(c_bajar);
                    data.commands = [cdo];
                    complete("fin");
                } else
                //brillo
                if (params.hasOwnProperty("c_brillo") && params.c_brillo != "") {
                    // bajar volumen o canal

                    var cdo = obtenerBrillo(params.c_brillo);
                    data.commands = [cdo];
                    complete("fin");
                } else
                if (params.hasOwnProperty("c_color") && params.c_color != "") {
                    // bajar volumen o canal

                    var cdo = obtenerColor(params.c_color);
                    data.commands = [cdo];
                    complete("fin");
                } else
                if (params.hasOwnProperty("c_temperatura") && params.c_temperatura != "") {
                    // bajar volumen o canal

                    var cdo = obtenerTemp(params.c_temperatura);
                    data.commands = [cdo];
                    complete("fin");
                } else
                // if (params.hasOwnProperty(key) && params[key] != "") {
                //     data.commands.add(params[key[0]]);
                //     complete("fin");
                // } else 
                {
                    complete("error");
                }
            },
            on: {
                fin: 'fin',
                error: 'error'
            }
        },
        fin: {
            type: 'end',
            action: function(complete) {
                console.log("end");
                data.mensaje = "exitoso";
                complete('finished');
            }
        },
        error: {
            type: 'end',
            action: function(complete) {
                console.log("error");
                data.mensaje = "error";
                complete('finished');
            }
        }
    });
    flow.start(function(event) {
        console.log('flow result:', event);
        console.log(data.mensaje);
    });

    console.log('salio');
    return data;
}


module.exports = {
    webhook
}