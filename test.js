addLabelsOnWI("dhksjlhdskjhd djskah ajhljkfhsd jhhajh \r\n\r\nAB#1234");

async function addLabelsOnWI(desc){
    let str = desc;
    if (str.includes("AB#")){
        const id = str.substring(str.search("AB#") + 3);
        console.log(id);
    } else {
        console.log("no hay");
    }
    
}