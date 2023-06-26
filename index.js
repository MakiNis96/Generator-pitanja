import { alertKviz, azurirajKorisnika, izdvojUsername, vratiKorisnika, timeout } from './endpoints.js'

export let username
const stranica = 'uputstvo'
let korisnik

window.addEventListener('load', async function () {
    try {
        korisnik = await izdvojUsername()
        username = korisnik.username
        document.getElementById('aplikacija').href = `./app.html?username=${username}`
        document.getElementById('slobodnoKoriscenje').href = `./app.html?username=${username}`
        document.getElementById('pozdrav').innerHTML = username

        setTimeout(otvaranjeZadatka, timeout)
    } catch(error) {
        uradiKviz.style.display = 'none'
        document.getElementById('serverStop').style.display = 'block'
    }
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
const start = (new Date()).getTime()

window.onbeforeunload = async function () {
    const time = Math.round(TimeMe.getTimeOnCurrentPageInSeconds())
    korisnik = await azurirajKorisnika(korisnik, {
        stranica,
        vreme: time,
        start: start,
        end: (new Date()).getTime()
    })
}

// window.addEventListener('visibilitychange', async function () {
    // if (document.hidden) {
    //     const time = Math.round(TimeMe.getTimeOnCurrentPageInSeconds())
    //     korisnik = await azurirajKorisnika(korisnik, {
    //         stranica,
    //         vreme: time
    //     })
    // } else {
    //     TimeMe.stopTimer()
    //     TimeMe.resetRecordedPageTime(stranica);
    //     TimeMe.startTimer()
    //     korisnik = await vratiKorisnika(username)
    // }
// })
