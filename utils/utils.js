export function getCaracterPosition(string, caracter) {

    let caractePos = [];

    for(let i = 0; i < string.length; i++) {
    
        if(string[i] === caracter){
            caractePos.push(i);
        }

    }

    return caractePos;

}

export function getArrayDimensions(arr) {
    let dimensions = 0;
    let temp = [...arr];

    while (Array.isArray(temp)) {
        dimensions++;
        temp = temp[0];
    }

    return dimensions;
}