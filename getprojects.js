const fetch = require(`node-fetch-commonjs`);

var server = 'https://dev.azure.com/occmundial/_apis/projects?api-version=2.0';
var headers = {
    'Content-Type': 'application/json; charset=utf-8;',
    'Authorization': 'Basic ' + Buffer.from(''+":"+pat, 'ascii').toString('base64')
};
const options = {
    method: "GET",
    headers: headers
};

console.log(headers);

fetch(server, options)
    .then(response => response.json())
    .then(response => {
        console.log('Web API responds:');
        //console.log(response);
        console.log(JSON.stringify(response.value[0], null, 4));
    }).catch(error => {
        console.error(error);
    }); 