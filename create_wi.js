import fetch from 'node-fetch';

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
      "value": "New work item from node 2"
    },
    {
      "op": "add",
      "path": "/fields/System.Description",
      "from": null,
      "value": "Creado con api jejeje"
    },
    {
      "op": "add",
      "path": "/fields/System.AreaPath",
      "from": null,
      "value": "Workshop\\RedTeam"
    },
    {
      "op": "add",
      "path": "/fields/System.Tags",
      "from": null,
      "value": "Security; security fix; Demo"
    },
    {
      "op": "add",
      "path": "/fields/System.State",
      "from": null,
      "value": "Active"
    },
    {
      "op": "add",
      "path": "/fields/System.AssignedTo",
      "from": null,
      "value": "Alan Garcia Bolaños"
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