async function sha512(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const hashBuffer = await crypto.subtle.digest('SHA-512', data);

    // ArrayBuffer → hex
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return hashHex;
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

const signCookie = async (data, timestamp, id) => {
    console.log(data)

    const wra_attest = localStorage.getItem('wra-attest')
    const wra_public = localStorage.getItem('wra-public')

    console.log(wra_attest, wra_public, data, timestamp, id)

    const signed = await sha512(wra_attest + wra_public + data + timestamp + id)

    return signed

    // return 1
}


