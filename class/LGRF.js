// node 
//> var d = require("./class/LGRF");
//> d.obtenerComandoTV("IROnOff");
const obtenerComandoTV = (entity) => {
    console.log("obtenerComandoTV entity", entity);
    switch (entity) {
        case ("encender"):
            return "tvOnOff";
        case ("apagar"):
            return "tvOnOff";
        case ("csubir"):
            return "tvChannelUp";
        case ("cbajar"):
            return "tvChannelDown";
        case ("vsubir"):
            return "tvVolumeUp";
        case ("vbajar"):
            return "tvVolumeDown";
        case ("flecha arriba"):
            return "tvArrowUp";
        case ("flecha abajo"):
            return "tvArrowDown";
        case ("flecha derecha"):
            return "tvArrowRight";
        case ("flecha izquierda"):
            return "tvArrowLeft";
        case ("aceptar"):
            return "tvOkButton";
        case ("atras"):
            return "tvBackButton";
        case ("entrada"):
            return "tvInputButton";
        case ("inicio"):
            return "tvHomeButton";
        case ("menu"):
            return "tvMenuButton";
        case ("av"):
            return "tvAvButton";
        case ("1"):
            return "tvOneButton";
        case ("2"):
            return "tvTwoButton";
        case ("3"):
            return "tvThreeButton";
        case ("4"):
            return "tvFourButton";
        case ("5"):
            return "tvFiveButton";
        case ("6"):
            return "tvSixButton";
        case ("7"):
            return "tvSevenButton";
        case ("8"):
            return "tvEightButton";
        case ("9"):
            return "tvNineButton";
        case ("0"):
            return "tvZeroButton";
    }
}

const obtenerCanales = (canal) => {
    var cdos = [];
    var aCanal = Array.from(canal.toString());
    aCanal.forEach(num => {
        cdos.push(obtenerComandoTV(num));
    });
    return cdos;
}

module.exports = {
    obtenerComandoTV,
    obtenerCanales
};