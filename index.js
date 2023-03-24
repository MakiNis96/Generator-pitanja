import { alertKviz, azurirajKorisnika, izdvojUsername, vratiKorisnika, timeout } from './endpoints.js'

export let username
const stranica = 'uputstvo'
let korisnik

window.addEventListener('load', async function () {
    try {
        korisnik = await izdvojUsername()
    } catch(error) {
        document.getElementById('serverStop').style.display = 'block'
    }
    username = korisnik.username
    document.getElementById('aplikacija').href = `./app.html?username=${username}`
    document.getElementById('slobodnoKoriscenje').href = `./app.html?username=${username}`
    document.getElementById('pozdrav').innerHTML = username

    setTimeout(otvaranjeZadatka, timeout)
})

const uradiKviz = document.getElementById('uradiKviz')

async function otvaranjeZadatka() {
    closeConfirmBox()
    showConfirmBox()
    uradiKviz.style.display = 'block'
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
    currentPageName: stranica,
    idleTimeoutInSeconds: 10,
});
window.onbeforeunload = async function () {
    const time = Math.round(TimeMe.getTimeOnCurrentPageInSeconds())
    korisnik = await azurirajKorisnika(korisnik, {
        stranica,
        vreme: time
    })
}

window.addEventListener('visibilitychange', async function () {
    if (document.hidden) {
        const time = Math.round(TimeMe.getTimeOnCurrentPageInSeconds())
        korisnik = await azurirajKorisnika(korisnik, {
            stranica,
            vreme: time
        })
    } else {
        TimeMe.stopTimer()
        TimeMe.resetRecordedPageTime(stranica);
        TimeMe.startTimer()
        korisnik = await vratiKorisnika(username)
    }
})

// db.json
// odgovori - {zadatakId (1 ili 2), username, odgovor (sve iz strukture podaci)}
// vreme - {username, stranica ('uputstvo', 'zadatak-0', 'zadatak-1', 'zadatak-2'), ukupnoVreme}

// pokretanje:
// http-server -c-1 i npm start (u pozaditi pokrece: json-server --watch db.json)
// mora da se postavi backPort i backHost (za json-server) u config fajlu
