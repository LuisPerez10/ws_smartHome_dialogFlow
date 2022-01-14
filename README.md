
## Servicio Web SmartHome DialogFLow
Servicio web para recibir una solicitud POST de DialogFlow en forma de respuesta a una consulta de usuario que coincida con las interacciones con el Webhook habilitado

```mermaid
graph LR
A[Client] -- http  --> B[DialogFlow]
B -- http  --> C[ws_SmartHome_DialogFlow]
A --http--> D(OpenHab3)
D --mqtt--> E[MQTT Server]
E--http-->F(Controlador )