
const { Octokit, App } = require("octokit");


const otrafuncion = async () => {
    labels = await addLabelsOnWI("");
    labels.data.forEach((item) => {
        console.log('name: ' + item.name);
    });

}

async function addLabelsOnWI(vm){
    const octokit = new Octokit({
      auth: vm
    })
    
    var result = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/labels',{
      owner: "occmundial",
      repo: "security-tests",
      issue_number: "87"
    })

    
    return result;
}

otrafuncion();