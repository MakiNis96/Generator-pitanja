import { izdvojUsername, pribaviOdgovore } from './endpoints.js'

let username, podsetnik = true

window.addEventListener('load', async function () {
    let username = izdvojUsername()
    document.getElementById('aplikacija').href = `./app.html?username=${username}`
    document.getElementById('slobodnoKoriscenje').href = `./app.html?username=${username}`
    hj('tagRecording', [username])

    setInterval(otvaranjeZadatka, 10 * 1000)
})

async function otvaranjeZadatka() {
    if (podsetnik) {
        closeConfirmBox()
        const odgovori = await pribaviOdgovore(username)
        document.getElementById('btnPrvi').innerHTML = `Zelim da uradim  
            ${odgovori.find(odgovor => odgovor.zadatakId === 1) ? 'ponovo ' : ''} laksi zadatak`
        document.getElementById('btnDrugi').innerHTML = `Zelim da uradim  
            ${odgovori.find(odgovor => odgovor.zadatakId === 2) ? 'ponovo ' : ''} tezi zadatak`
        showConfirmBox()
    }
}

function showConfirmBox() {
    document.getElementById("overlay").hidden = false;
}
function closeConfirmBox() {
    document.getElementById("overlay").hidden = true;
}

function otvoriZadatak(idZadatka) {
    closeConfirmBox();
    window.location = `./app.html?id=${idZadatka}`
}
 
document.getElementById('btnPrvi').addEventListener('click', () => otvoriZadatak('1'))
document.getElementById('btnDrugi').addEventListener('click', () => otvoriZadatak('2'))
document.getElementById('btnPodseti').addEventListener('click', closeConfirmBox)
document.getElementById('btnNe').addEventListener('click', () => {
    closeConfirmBox()
    podsetnik = false
})
document.getElementById('btnClose').addEventListener('click', closeConfirmBox)

// za postavljanje
// http-server i json-server
// json-server db.json
// http-server mozda mora https, mora da se podese urlovi u hotjar i da se ubaci tracking code na stranicama
// mora da se promeni backUrl u config fajlu
// otvaranje zadatka na 1min 