export function getCaracterPosition(string, caracter) {

    let caractePos = [];

    for(let i = 0; i < string.length; i++) {
    
        if(string[i] === caracter){
            caractePos.push(i);
        }

    }

    return caractePos;

}