import { alertKviz, izdvojUsername, pribaviOdgovore, timeout } from './endpoints.js'

let username// , podsetnik = true

window.addEventListener('load', async function () {
    username = izdvojUsername()
    document.getElementById('aplikacija').href = `./app.html?username=${username}`
    document.getElementById('slobodnoKoriscenje').href = `./app.html?username=${username}`
    document.getElementById('pozdrav').innerHTML = username
    hj('tagRecording', [username])

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

// za postavljanje
// http-server i json-server
// pokretanje http-servera: http-server -S -C cert.pem -o -c-1
// pokretanje json-servera: npm start (pre toga npm install)
// mora da se podese urlovi u hotjar i da se ubaci tracking code na stranicama
// mora da se promeni backPort i backHost u config fajlu
// otvaranje zadatka na 1min 

// interfejs promene:
// da mu kazem da je gore link uvek nakon pojave dijaloga podseti, ne podsecaj i to