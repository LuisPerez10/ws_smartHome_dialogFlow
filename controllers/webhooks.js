const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const { response } = require('express');
const stateflow = require('stateflow');
const { obtenerCanales, obtenerComandoTV } = require('../class/LGRF');
const { obtenerBrillo, obtenerTemp, obtenerColor } = require('../class/broadlink');
const { json } = require('body-parser');
const { obtenerMensaje } = require('../class/mensajeResponse');



const webhook = async(req, res = response) => {
    console.log('webhook ok');
    const agent = new WebhookClient({ request: req, response: res });

    async function accionSensor(req, res) {
        var action = agent.action;
        var params = agent.parameters;
        var data = {};
        var mensaje;
        if (params.hasOwnProperty("a_encender") && params.a_encender != "") {
            mensaje = obtenerMensaje(params.a_encender, action);
            data.commands = ["ON"]
        } else
        if (params.hasOwnProperty("a_apagar") && params.a_apagar != "") {
            console.log("obtenerMensaje");
            mensaje = obtenerMensaje(params.a_apagar, action);
            data.commands = ["OFF"]
        } else {
            mensaje = "Error al interpretar el mensaje";
        }
        data.item = action;
        agent.add(mensaje);
        agent.add(new Payload(agent.UNSPECIFIED, data, { rawPayload: true, sendAsMessage: true }));
    }
    async function estadoIluminacion(req, res) {
        var action = agent.action;
        var data = {};
        var mensaje;
        mensaje = obtenerMensaje("", action);
        data.commands = null
        data.item = action;
        agent.add(mensaje);
        agent.add(new Payload(agent.UNSPECIFIED, data, { rawPayload: true, sendAsMessage: true }));
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
        var { msg, ...data } = fulldata;
        if (msg.localeCompare("ok") == 0) {
            var cdos = Object.keys(params).filter(v => /^c_/.test(v));
            if (cdos.length == 0) {
                cdos = Object.keys(params).filter(v => /^a_/.test(v));
            }
            var cdo;
            cdos.forEach((ele) => {
                if (params[ele] != "") {
                    cdo = ele;
                }
            })
            var mensaje = obtenerMensaje(params[cdo], agent.action);
        } else {
            var mensaje = "Error al interpretar el mensaje";
        }

        //enviar respuesta
        agent.add(mensaje);
        data.item = agent.action;
        // data.commands = JSON.stringify(data.commands);
        agent.add(new Payload(agent.UNSPECIFIED, data, { rawPayload: true, sendAsMessage: true }));
    }




    let intentMap = new Map();
    // intentMap.set('saludo', sayHello2);
    intentMap.set('s_accion_sensor', accionSensor);
    intentMap.set('s_estado_luz', estadoIluminacion);
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

    agent.handleRequest(intentMap);
}



const maquinaSuperlativa = async(params) => {
    console.log("maquinaEstado");
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
                } else
                if (params.hasOwnProperty("c_subir") && params.c_subir != "") {
                    console.log("c_subir ok");
                    complete("commands");
                } else
                if (params.hasOwnProperty("c_bajar") && params.c_bajar != "") {
                    complete("commands");
                } else {
                    complete("error");
                }
            },
            on: {
                action_ea: 'action_ea',
                commands: 'commands',
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
                // falta verificar si las keys son nulas sino tira error
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
                    var c_subir = params.hasOwnProperty("at_canal") ? "csubir" : "vsubir"
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
                if (params.hasOwnProperty("c_brillo") && params.c_brillo != "") {
                    var cdo = obtenerBrillo(params.c_brillo);
                    data.commands = [cdo];
                    complete("fin");
                } else
                if (params.hasOwnProperty("c_color") && params.c_color != "") {
                    var cdo = obtenerColor(params.c_color);
                    data.commands = [cdo];
                    complete("fin");
                } else
                if (params.hasOwnProperty("c_temperatura") && params.c_temperatura != "") {
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
                data.msg = "ok"
                complete('finished');
            }
        },
        error: {
            type: 'end',
            action: function(complete) {
                console.log("error");
                data.msg = "error";
                complete('finished');
            }
        }
    });
    flow.start(function(event) {
        console.log('flow result:', event);
        console.log(data.msg);
    });

    console.log('salio');
    return data;
}


module.exports = {
    webhook
}