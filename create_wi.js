import fetch from 'node-fetch';

let pat = 'qpftyfvsfdog7y5ar54nsmq4n7mwu5am6gshggbjfvzldy7xztva';
var server = 'https://dev.azure.com/occmundial/Workshop/_apis/wit/workitems/$User Story?api-version=7.1-preview.3';
var headers = {
    'Content-Type': 'application/json-patch+json',
    'Authorization': 'Basic ' + Buffer.from(''+":"+pat, 'ascii').toString('base64')
};


let body = [
    {
      "op": "add",
      "path": "/fields/System.Title",
      "from": null,
      "value": "Test5"
    },
    {
      "op": "add",
      "path": "/fields/System.Description",
      "from": null,
      "value": "Creado con api"
    },
    {
      "op": "add",
      "path": "/fields/System.AreaPath",
      "from": null,
      "value": "Workshop\\Equipo azul"
    },
    {
      "op": "add",
      "path": "/fields/System.Tags",
      "from": null,
      "value": "Security; security fix"
    }
];

const options = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
};

fetch(server, options)
    .then(response => response.json())
    .then(response => {
        console.log('Web API responds:');
        console.log(response);
    }).catch(error => {
        console.error(error);
    }); 