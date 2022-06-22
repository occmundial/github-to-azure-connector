import fetch from 'node-fetch';
// ("Authorization", "Basic " + btoa('Basic' + ":" + 'YOUR_PAT_TOKEN'));
// 'Basic v4x2bylpdef6y2ms44yg7l3eb2kc5lfiu5cn2rzpfqqk5swxfzsq'
// djR4MmJ5bHBkZWY2eTJtczQ0eWc3bDNlYjJrYzVsZml1NWNuMnJ6cGZxcWs1c3d4ZnpzcQ==

let pat = 'v4x2bylpdef6y2ms44yg7l3eb2kc5lfiu5cn2rzpfqqk5swxfzsq';
var server = 'https://dev.azure.com/occmundial/_apis/projects?api-version=2.0';
var headers = {
    'Content-Type': 'application/json; charset=utf-8;',
    'Authorization': 'Basic ' + Buffer.from(pat).toString('base64')
};
const options = {
    method: "GET",
    headers: headers
};

console.log(headers);

//const response = await fetch(server, { method: 'GET', headers: headers})

/*const r1 = response.clone();

const results = await Promise.all([response.json(), r1.text()]);

console.log(results[0]);
console.log(results[1]); */


/* fetch(server, options)
        //.then(response => response.json())
        .then(response => {
            console.log('Web API responds:');
            console.log(response);
            //console.log(JSON.stringify(response.value[0], null, 4));
        }).catch(error => {
            console.error(error);
        }); */