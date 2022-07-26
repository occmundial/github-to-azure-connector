const github = require(`@actions/github`);
const fetch = require(`node-fetch-commonjs`);
const { Octokit, App } = require("octokit");

const context = github.context;
const env = process.env;

let vm = [];
vm = getValuesFromPayload(github.context.payload, env);
main(vm);

function main(vm){

  switch (vm.action){
    case "opened":
      console.log("opened state run");
      createWI(vm);
      break;
    case "edited":
      console.log("edited state run");
      //Function to edit WI
      break;
    case "labeled":
      console.log("labeled state run");
      //Function to add label
      //addLabelsOnWI(vm);
      break;
    default:
      console.log(`This is a diferent action: ${vm.action}`);
  }
  
}

// get object values from the payload that will be used for logic, updates, finds, and creates
function getValuesFromPayload(payload, env) {
    // prettier-ignore
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
          label: "",
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
              iterationPath: env.ado_iteration_path != undefined ? env.ado_iteration_path : "",
              wit: env.ado_wit != undefined ? env.ado_wit : "Issue",
              adoParent: env.ado_parent != undefined ? env.ado_parent : "",
              closedState: env.ado_close_state != undefined ? env.ado_close_state : "Closed",
              newState: env.ado_new_state != undefined ? env.ado_new_state : "New",
              activeState: env.ado_active_state != undefined ? env.ado_active_state : "Active",
              bypassRules: env.ado_bypassrules != undefined ? env.ado_bypassrules : false,
        logLevel: env.log_level != undefined ? env.log_level : 100
          }
      };
  
    // label is not always part of the payload
    if (payload.label != undefined) {
      vm.label = payload.label.name != undefined ? payload.label.name : "";
    }
  
    // comments are not always part of the payload
    // prettier-ignore
    if (payload.comment != undefined) {
          vm.comment_text = payload.comment.body != undefined ? payload.comment.body : "";
          vm.comment_url = payload.comment.html_url != undefined ? payload.comment.html_url : "";
      }
  
    // split repo full name to get the org and repository names
    if (vm.repo_fullname != "") {
      var split = payload.repository.full_name.split("/");
      vm.organization = split[0] != undefined ? split[0] : "";
      vm.repository = split[1] != undefined ? split[1] : "";
    }
    
    // verbose logging
    if (vm.env.logLevel >= 300) {
      console.log("Print vm:");
      console.log(vm);
    }
  
    return vm;
  }

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
          "from": null,
          "value": vm.title
        },
        {
          "op": "add",
          "path": "/fields/System.Description",
          "from": null,
          "value": vm.body
        },
        {
          "op": "add",
          "path": "/fields/System.AreaPath",
          "from": null,
          "value": vm.env.areaPath
        },
        {
          "op": "add",
          "path": "/fields/System.Tags",
          "from": null,
          "value": vm.label
        },
        {
          "op": "add",
          "path": "/fields/System.State",
          "from": null,
          "value": vm.env.activeState
        },
        {
          "op": "add",
          "path": "/fields/System.AssignedTo",
          "from": null,
          "value": "Alan Garcia Bolaños"
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
          //console.log(response.id);
          //console.log(vm);
          console.log(updateIssueBody(vm,response.id));

      }).catch(error => {
          console.error(error);
      }); 
  }

  function updateIssueBody(vm, workItemID) {
    if (vm.env.logLevel >= 200) console.log(`Starting 'updateIssueBody' method...`);
  
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
  
      // verbose logging
      if (vm.env.logLevel >= 300) {
        console.log("Print github issue update result:");
        console.log(result);
      }
      addLabelsOnWI(workItemID, vm);
      return result;
    }
  
    return null;
  }

  function addLabelsOnWI(ID, vm){
    let token = vm.env.adoToken;
    let pat = token;
    var server = `https://dev.azure.com/${vm.env.organization}/${vm.env.project}/_apis/wit/workitems/${ID}?api-version=7.1-preview.3`;
    var headers = {
        'Content-Type': 'application/json-patch+json',
        'Authorization': 'Basic ' + Buffer.from(''+":"+pat, 'ascii').toString('base64')
    };
    let body = [
      {
        "op": "add",
        "path": "/fields/System.Tags",
        "from": null,
        "value": vm.label
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
          console.log(response);
      }).catch(error => {
          console.error(error);
      }); 

  }

  function editWI(vm){
    let str = vm.body;
    if (str.includes("AB#")){
      let position = (str.search("AB#") + 3);
      const id = str.substring(position);
      console.log(id);
    } else {
      console.log(":c");
    }
  }