const github = require(`@actions/github`);
const fetch = require(`node-fetch-commonjs`);
const { Octokit, App } = require("octokit");
//addLabelsOnWI(getissue("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"));

/* async function addLabelsOnWI(desc){
    let str = desc;
    if (str.includes("AB#")){
        const id = str.substring(str.search("AB#") + 3);
        console.log(id);
    } else {
        console.log("no hay");
    }
    
} 
async function getissue(token){
    const octokit = new Octokit({
        auth: token
      })
      
      var result =  await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
        owner: "occmundial",
        repo: "security-tests",
        issue_number: 92
      })
      return result.data.body;
}
const otrafuncion = async () => { 
    addLabelsOnWI(await getissue(""));
}
otrafuncion(); */

async function getLabels(tokenAzure,tokenGithub){
    const octokit = new Octokit({
        auth: tokenGithub
      })
      
      var result =  await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
        owner: "occmundial",
        repo: "security-tests",
        issue_number: 132
      })
  
      var id = "";
      let str = result.data.body;
      if (str.includes("AB#")){
        let position = (str.search("AB#") + 3);
        id = str.substring(position);
      } else {
        return "No hay AB";
      }
  
      let token = tokenAzure;
      let pat = token;
      var server = `https://dev.azure.com/occmundial/Workshop/_apis/wit/workitems/${id}?api-version=7.1-preview.3`;
      var headers = {
          'Content-Type': 'application/json-patch+json',
          'Authorization': 'Basic ' + Buffer.from(''+":"+pat, 'ascii').toString('base64')
      };
      let body = [
        {
          "op": "add",
          "path": "/fields/System.Description",
          "value": result.data.body
        }
      ];
  
      const options = {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(body),
      };
  
      fetch(server, options)
        .then(response => response.json())
        .then(response => {
            return response;
        }).catch(error => {
            return error;
        }); 
    return result;
}
const otrafuncion = async () => { 
    console.log(await getLabels("", ""));
}
otrafuncion(); 


  
