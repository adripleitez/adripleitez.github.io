export function ciphervigenere(msg, key) {
    const alf = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const ALF_SIZE = alf.length;
    const MSG_SIZE = msg.length;
    const KEY_SIZE = key.length;

    var values_key = [];
    for (let i = 0; i < KEY_SIZE; i++) {
        for (let j = 0; j < ALF_SIZE; j++) {
            if (key[i] === alf[j]) {
                values_key[i] = j;
            }
        }
    }

    var msg_ciph = [];
    for (let i = 0; i < MSG_SIZE; i++) {
        var l;
        for (let j = 0; j < ALF_SIZE; j++) {
            if (msg[i] === alf[j]) {
                l = j;
            }
        }
        msg_ciph[i] = alf[(values_key[i % KEY_SIZE] + l) % ALF_SIZE];
    }
    var str = "";
    for (let i = 0; i < MSG_SIZE; i++) {
        str += msg_ciph[i];
    }
    //console.log(str);
    return str;
}

export function decipheredvigenere(msg, key) {

    const alf = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const ALF_SIZE = alf.length;
    const MSG_SIZE = msg.length;
    const KEY_SIZE = key.length;

    // Guardar values de la key
    var values_key = [];
    for (let i = 0; i < KEY_SIZE; i++) {
        for (let j = 0; j < ALF_SIZE; j++) {
            if (key[i] === alf[j]) {
                values_key[i] = j;
            }
        }
    }

    function modNeg(n1, n2) {
        var mod = n1;
        while (mod < 0) {
            mod += n2;
        }
        return mod;
    }

    // Descifrar
    var msg_descifrado = [];
    for (let i = 0; i < MSG_SIZE; i++) {
        var l;
        for (let j = 0; j < ALF_SIZE; j++) {
            if (msg[i] === alf[j]) {
                l = j;
            }
        }
        msg_descifrado[i] = alf[modNeg((l - values_key[i % KEY_SIZE]), ALF_SIZE)];
    }

    var str = "";
    for (let i = 0; i < MSG_SIZE; i++) {
        str += msg_descifrado[i];
    }

    return str + "\n"; 
}