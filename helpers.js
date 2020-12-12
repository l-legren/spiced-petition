const makeStringCapital = (str) => {
    let stringSplit = str.split(" ");
    const stringCapitalized = [];
    for (let i = 0; i < stringSplit.length; i++) {
        stringCapitalized.push(
            stringSplit[i].charAt(0).toUpperCase() + stringSplit[i].slice(1)
        );
    }
    let stringCap = stringCapitalized.join(" ");
    return stringCap;
};

exports.makeStringCapital = makeStringCapital;