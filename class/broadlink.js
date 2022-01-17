const obtenerBrillo = (entity) => {
    switch (entity) {
        case "alto":
            return 100;
        case "medio":
            return 50;
        case "bajo":
            return 1;
        default:
            return 80;
    }
};
const obtenerTemp = (entity) => {
    switch (entity) {
        case "frio":
            return 6500;
        case "neutro":
            return 5000;
        case "calido":
            return 3000;
        default:
            return 6000;
    }
}
const obtenerColor = (entity) => {
    switch (entity) {
        case "rojo":
            return "0,100,55";
        case "verde":
            return "120,100,55";
        case "azul":
            return "236,100,55";
        default:
            return "300,100,55";
    }
    s
}

module.exports = {
    obtenerBrillo,
    obtenerTemp,
    obtenerColor

}