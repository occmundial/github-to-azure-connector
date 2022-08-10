const github = require(`@actions/github`);
const fetch = require(`node-fetch-commonjs`);
const { Octokit, App } = require("octokit");

const env = process.env;

let vm = [];
vm = getValuesFromPayload(github.context.payload, env);
main(vm);

function main(vm){

  switch (vm.env.githubIssueState){
    case "opened":
      //Function for Work Item creation and add AzureBoard ID to Github issue body
      createWI(vm);
      break;
    case "edited":
      //Function to edit WI
      editWI(vm);
      break;
    case "labeled":
      // Get labels from Github and add labels on Work Item, after Work Item creation
      const awaitLabels = async () => {
        let labels_array = [];
        labels = await getLabels(vm);
        labels.data.forEach((item) => {
          labels_array.push(item.name);
        });
        const labels_string = String(labels_array);
        const awaitAddLabels = async () => {
          console.log(await addLabelsOnWI(labels_string));
        }
        awaitAddLabels();
      }
      awaitLabels();
      break;
    default:
      console.log(`This is a diferent action: ${vm.action}`);
  }
  
}

// Get information from Github Issue and Github Action (environment parameters)
function getValuesFromPayload(payload, env) {
    var vm = {
          action: payload.action != undefined ? payload.action : "",
          url: payload.issue.html_url != undefined ? payload.issue.html_url : "",
          number: payload.issue.number != undefined ? payload.issue.number : -1,
          title: payload.issue.title != undefined ? payload.issue.title : "",
          state: payload.issue.state != undefined ? payload.issue.state : "",
          user: payload.issue.user.login != undefined ? payload.issue.user.login : "",
          body: payload.issue.body != undefined ? payload.issue.body : "",
          repo_fullname: payload.repository.full_name != undefined ? payload.repository.full_name : "",
          repo_name: payload.repository.name != undefined ? payload.repository.name : "",
          repo_url: payload.repository.html_url != undefined ? payload.repository.html_url : "",
          closed_at: payload.issue.closed_at != undefined ? payload.issue.closed_at : null,
          owner: payload.repository.owner != undefined ? payload.repository.owner.login : "",
          sender_login: payload.sender.login != undefined ? payload.sender.login : '',
          comment_text: "",
          comment_url: "",
          organization: "",
          repository: "",
          env: {
              organization: env.ado_organization != undefined ? env.ado_organization : "",
              orgUrl: env.ado_organization != undefined ? "https://dev.azure.com/" + env.ado_organization : "",
              adoToken: env.ado_token != undefined ? env.ado_token : "",
              ghToken: env.github_token != undefined ? env.github_token : "",
              project: env.ado_project != undefined ? env.ado_project : "",
              areaPath: env.ado_area_path != undefined ? env.ado_area_path : "",
              wit: env.ado_wit != undefined ? env.ado_wit : "Issue",
              adoParent: env.ado_parent != undefined ? env.ado_parent : "",
              activeState: env.ado_active_state != undefined ? env.ado_active_state : "Active",
              githubIssueState: env. github_issue_state != undefined ? env. github_issue_state : "default",
              assigne: env.ado_assigne != undefined ? env.ado_assigne:""
          }
      };
  
    // split repo full name to get the org and repository names
    if (vm.repo_fullname != "") {
      var split = payload.repository.full_name.split("/");
      vm.organization = split[0] != undefined ? split[0] : "";
      vm.repository = split[1] != undefined ? split[1] : "";
    }
  
    return vm;
  }

  //Functión to create Work Item, getting parameters from VM
  function createWI(vm){
    let token = vm.env.adoToken;
    let pat = token;
    var server = `https://dev.azure.com/${vm.env.organization}/${vm.env.project}/_apis/wit/workitems/$${vm.env.wit}?api-version=7.1-preview.3`;
    var headers = {
        'Content-Type': 'application/json-patch+json',
        'Authorization': 'Basic ' + Buffer.from(''+":"+pat, 'ascii').toString('base64')
    };
  
    let body = [
        {
          "op": "add",
          "path": "/fields/System.Title",
          "value": vm.title
        },
        {
          "op": "add",
          "path": "/fields/System.Description",
          "value": vm.body
        },
        {
          "op": "add",
          "path": "/fields/System.AreaPath",
          "value": vm.env.areaPath
        },
        {
          "op": "add",
          "path": "/fields/System.State",
          "value": vm.env.activeState
        },
        {
          "op": "add",
          "path": "/fields/System.AssignedTo",
          "value": vm.env.assigne
        },
        {
          "op": "add",
          "path": "/relations/-",
          "value": {
            "rel": "System.LinkTypes.Hierarchy-Reverse",
            "url": vm.env.adoParent
          }
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
          console.log(updateIssueBody(vm,response.id));
      }).catch(error => {
          console.error(error);
      }); 
  }

  //Get Work Item ID from Azure and add it to Github issue body (AB#ID)
  function updateIssueBody(vm, workItemID) {
  
    var n = vm.body.includes("AB#" + workItemID.toString());  
  
    if (!n) {
      vm.body = vm.body + "\r\n\r\nAB#" + workItemID.toString();
      const octokit = new Octokit({
        auth: vm.env.ghToken
      })
      
      var result = octokit.request(`PATCH /repos/${vm.owner}/${vm.repository}/issues/${vm.number}`, {
        owner: vm.owner,
        repo: vm.repository,
        issue_number: vm.number,
        body: vm.body,
      })
      return result;
    }
    return null;
  }

  //Get labes from Github Issue
  async function getLabels(vm){
    const octokit = new Octokit({
      auth: vm.env.ghToken
    })
    
    var result =  await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/labels',{
      owner: vm.owner,
      repo: vm.repository,
      issue_number: vm.number
    })

    return result;
  }

  //Add labes form Github issue to Work Item on Azure, Needs AB#ID
  async function addLabelsOnWI(labels){

    const octokit = new Octokit({
      auth: vm.env.ghToken
    })
    
    var result =  await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
      owner: vm.owner,
      repo: vm.repository,
      issue_number: vm.number
    })

    var id = "";
    let str = result.data.body;
    if (str.includes("AB#")){
      let position = (str.search("AB#") + 3);
      id = str.substring(position);
    } else {
      return "No hay AB";
    }

    let token = vm.env.adoToken;
    let pat = token;
    var server = `https://dev.azure.com/${vm.env.organization}/${vm.env.project}/_apis/wit/workitems/${id}?api-version=7.1-preview.3`;
    var headers = {
        'Content-Type': 'application/json-patch+json',
        'Authorization': 'Basic ' + Buffer.from(''+":"+pat, 'ascii').toString('base64')
    };
    let body = [
      {
        "op": "add",
        "path": "/fields/System.Tags",
        "value": labels
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

  }

  // Work in progress
  function editWI(vm){
    const octokit = new Octokit({
      auth: vm.env.ghToken
    })
    
    var result =  await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
      owner: vm.owner,
      repo: vm.repository,
      issue_number: vm.number
    })

    var id = "";
    let str = result.data.body;
    if (str.includes("AB#")){
      let position = (str.search("AB#") + 3);
      id = str.substring(position);
    } else {
      return "No hay AB";
    }

    let token = vm.env.adoToken;
    let pat = token;
    var server = `https://dev.azure.com/${vm.env.organization}/${vm.env.project}/_apis/wit/workitems/${id}?api-version=7.1-preview.3`;
    var headers = {
        'Content-Type': 'application/json-patch+json',
        'Authorization': 'Basic ' + Buffer.from(''+":"+pat, 'ascii').toString('base64')
    };
    let body = [
      {
        "op": "add",
        "path": "/fields/System.Title",
        "value": result.data.title
      },
      {
        "op": "add",
        "path": "/fields/System.Description",
        "value": result.data.body
      },
      {
        "op": "add",
        "path": "/fields/System.State",
        "value": result.data.state
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
  }