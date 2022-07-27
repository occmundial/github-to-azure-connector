
const { Octokit, App } = require("octokit");
//addLabelsOnWI(getissue("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"));

async function addLabelsOnWI(desc){
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
otrafuncion();

