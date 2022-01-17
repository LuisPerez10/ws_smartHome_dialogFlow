require('dotenv').config();

var express = require("express");

const { dbConnection } = require('./database/config');
var stateflow = require('stateflow');
const { param } = require('./routes/webhook');
const { obtenerCanales, obtenerComandoTV } = require('./class/LGRF');
const { obtenerBrillo, obtenerTemp, obtenerColor } = require('./class/broadlink');

// const mongoose = require('mongoose');


// crear servidor express
var app = express();

// lectura y parseo del body
app.use(express.json());

// Base de datos
// dbConnection();

// Node Server
const server = require('http').createServer(app);


app.use('/api/webhook', require('./routes/webhook'));

app.get("/pruba", (req, res) => {
    // var data = { action: '', to: '', attrib: '', commands: [] };
    var data = {};
    // var params = { t_tv: 'televisor', a_encender: 'asd' };
    // var params = { t_foco: 'televisor', a_apagar: '', a_encender: 'encender', at_color: 'color', c_commands: "verde" };
    // var params = { t_tv: 'televisor', a_poner: 'd', at_canal: 'canal', c_canal_num: '1' };
    // var params = { t_tv: 'poner', a_encender: 'apagar', c_color: 'rojo' };
    // var params = { t_tv: 'd', a_encender: 'encender' };
    var params = {
        a_encender: 'encender',
        t_tv: 'televisor',
        t_foco: '',
        a_apagar: ''
    };


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
                        if (params.hasOwnProperty("t_foco")) {
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
                        if (params.hasOwnProperty("t_foco")) {
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
                // if (params.hasOwnProperty("at_brillo") && params.at_brillo != "") {
                //     data.attrib = "at_brillo";
                //     complete("commands");
                // } else
                // if (params.hasOwnProperty("at_canal") && params.at_canal != "") {
                //     data.attrib = "at_canal";
                //     complete("commands");
                // } else
                // if (params.hasOwnProperty("at_color") && params.at_color != "") {
                //     data.attrib = "at_color";
                //     complete("commands");
                // } else {
                //     complete("fin");
                //     // complete("error");
                // }
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
                complete('finished');
            }
        },
        error: {
            type: 'end',
            action: function(complete) {
                console.log("error");
                complete('finished');
            }
        }
    });
    flow.start(function(event) {
        console.log('flow result:', event);
        return res.json(data);
    });

});


server.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en puerto ' + process.env.PORT);
});