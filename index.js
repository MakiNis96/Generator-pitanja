import { alertKviz, izdvojUsername, vratiVreme, upisiVreme, azurirajVreme, timeout } from './endpoints.js'

export let username
let prethodnoVreme
const stranica = 'uputstvo' 

window.addEventListener('load', async function () {
    username = izdvojUsername()
    document.getElementById('aplikacija').href = `./app.html?username=${username}`
    document.getElementById('slobodnoKoriscenje').href = `./app.html?username=${username}`
    document.getElementById('pozdrav').innerHTML = username
    // hj('tagRecording', [username])

    prethodnoVreme = await vratiVreme(username, stranica)

    setTimeout(otvaranjeZadatka, timeout)
})

const uradiKviz = document.getElementById('uradiKviz')

async function otvaranjeZadatka() {
    // if (podsetnik) {
        closeConfirmBox()
        showConfirmBox()
        uradiKviz.style.display = 'block'
    // }
}

function showConfirmBox() {
    document.getElementById("overlay").hidden = false;
}
function closeConfirmBox() {
    document.getElementById("overlay").hidden = true;
}

function otvoriZadatak(idZadatka) {
    closeConfirmBox();
    window.open(`./app.html?id=${idZadatka}`, '_target')
}
 
document.getElementById('btnPrvi').addEventListener('click', () => {
    alertKviz()
    otvoriZadatak('1')
})
document.getElementById('btnDrugi').addEventListener('click', () => {
    alertKviz()
    otvoriZadatak('2')
})
document.getElementById('btnPodseti').addEventListener('click', () => {
    alertKviz()
    closeConfirmBox()
    setTimeout(otvaranjeZadatka, timeout)
})
document.getElementById('btnNe').addEventListener('click', () => {
    alertKviz()
    closeConfirmBox()
})

TimeMe.initialize({
    currentPageName: "home-page", // page name
    idleTimeoutInSeconds: 10 // stop recording time due to inactivity
});
window.onbeforeunload = async function () {
    const time = Math.round(TimeMe.getTimeOnCurrentPageInSeconds())
    if (prethodnoVreme.length === 0) {
        await upisiVreme(username, stranica, time)
    } else {
        const novoVreme = prethodnoVreme[0].vreme + time
        await azurirajVreme(prethodnoVreme[0].id, username, stranica, novoVreme)
    }
}

// za postavljanje
// http-server i json-server
// pokretanje http-servera: http-server -c-1
// pokretanje json-servera: json-server --watch db.json
// mora da se promeni backPort i backHost u config fajlu
// otvaranje zadatka na 1min

// db.json
// odgovori - {zadatakId (1 ili 2), username, odgovor (sve iz strukture podaci)}
// vreme - {username, stranica ('uputstvo', 'zadatak-0', 'zadatak-1', 'zadatak-2'), ukupnoVreme}
