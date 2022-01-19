const mensaje = (cdo, action) => {
    switch (action) {
        case "item_smart_led": //apagar encender
            return "Se ejecuto la accion " + cdo + "para el foco";
        case "item_smart_colortemp":
            return "La temperatura ha sido cambiado a " + cdo;
        case "item_color_picker":
            return "El color del foco ha sido cambiado a " + cdo;
        case "item_smart_brightness":
            return "El brillo del foco ha sido cambiado a " + cdo;
        case "control": //apagar encender, btn, num
            return "Se presionado el boton " + cdo
        case "NewItem":
            return "Se ejecuto la acción " + cdo + " para el sensor de acciones";
        case "text_sensor_value":
            return "El hambiente esta " + cdo;
    }
}

const obtenerMensaje = (cdos, action) => {
    console.log("obtenerMensaje");
    console.log(cdos);
    console.log(action);
    return mensaje(cdos, action);
}

module.exports = { obtenerMensaje };