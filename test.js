addLabelsOnWI("dhksjlhdskjhd djskah ajhljkfhsd jhhajh AB#1234");

async function addLabelsOnWI(desc){
    let str = desc;
    const id = str.substring(str.search("AB#") + 3);
    console.log(id);
}