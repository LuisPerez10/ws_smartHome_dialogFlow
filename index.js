require('dotenv').config();

var express = require("express");

const { dbConnection } = require('./database/config');
var stateflow = require('stateflow');
const { param } = require('./routes/webhook');
const { obtenerCanales } = require('./class/LGRF');

// const mongoose = require('mongoose');


// crear servidor express
var app = express();

// lectura y parseo del body
app.use(express.json());

// Base de datos
dbConnection();

// Node Server
const server = require('http').createServer(app);


app.use('/api/webhook', require('./routes/webhook'));

app.get("/pruba", (req, res) => {
    // var data = { action: '', to: '', attrib: '', commands: [] };
    var data = {};
    // var params = { t_tv: 'televisor', a_encender: 'asd' };
    // var params = { t_foco: 'televisor', a_apagar: '', a_encender: 'encender', at_color: 'color', c_commands: "verde" };
    var params = { t_tv: 'televisor', a_poner: 'd', at_canal: 'canal', c_canal_num: '1' };


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
                        data.action = "a_encender";
                        complete("action_ea");
                    } else
                    if (params.hasOwnProperty("a_apagar") && params.a_apagar != "") {
                        data.action = "a_apagar";
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
                // do something
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
                } else {
                    complete("fin");
                    // complete("error");
                }
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
                if (params.hasOwnProperty("at_canal") && params.at_canal != "") {
                    data.attrib = "at_canal";
                    complete("commands");
                } else
                if (params.hasOwnProperty("at_color") && params.at_color != "") {
                    data.attrib = "at_color";
                    complete("commands");
                } else {
                    complete("error");
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

                var key = Object.keys(params).filter(v => /^c_/.test(v));
                if (params.hasOwnProperty("c_canal_num") && params.c_canal_num != "") {
                    // ontener los comandos de los canales
                    var canales = obtenerCanales(params.c_canal_num);
                    console.log("push");

                    data.commands = [...canales];
                    complete("fin");
                } else
                if (param.hasOwnProperty("c_canal_btn") && params.c_canal_num != "") {
                    // ontener los comandos de btn
                    data.commands.add(params.c_canal_num);
                    complete("fin");
                } else
                if (params.hasOwnProperty(key) && params[key] != "") {
                    data.commands.add(params[key[0]]);
                    complete("fin");
                } else {
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