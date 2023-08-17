import { alertKviz, azurirajKorisnika, izdvojUsername, vratiKorisnika, timeout } from './endpoints.js'

export let username
const stranica = 'uputstvo'
let korisnik

const laksiItem = document.getElementById('laksi-item')
const teziItem = document.getElementById('tezi-item')

window.addEventListener('load', async function () {
    try {
        korisnik = await izdvojUsername()
        username = korisnik.username
        document.getElementById('pozdrav').innerHTML = username

        setTimeout(otvaranjeZadatka, timeout)
    } catch(error) {
        laksiItem.style.display = 'none'
        teziItem.style.display = 'none'
        document.getElementById('serverStop').style.display = 'block'
    }
})

async function otvaranjeZadatka() {
    closeConfirmBox()
    showConfirmBox()
    laksiItem.style.display = 'flex'
    teziItem.style.display = 'flex'
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
    korisnik = await azurirajKorisnika(username, {
        stranica,
        vreme: time,
        start: start,
        end: (new Date()).getTime()
    })
    // const cookies = document.cookie.split(';')
    // const cookieUsername = cookies.find(cookie => cookie.split('=')[0].includes('username'))
    // let username = cookieUsername ? cookieUsername.split('=')[1] : null
    // korisnik = await azurirajKorisnika(username, {
    //     stranica,
    //     vreme: time,
    //     start: start,
    //     end: (new Date()).getTime()
    // })
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

const navigacija = document.getElementById('navigacija')
const stavke = navigacija.querySelectorAll('li')
stavke.forEach((stavka, i) => stavka.style.borderLeft = `5px solid ${i === 0 ? '#B68181' : '#ddd'}`)
stavke[0].style.backgroundColor = '#ddd'
for (let i = 0; i < stavke.length; i++) {
    const stavka = stavke[i]
    stavka.addEventListener('click', function () {
        stavke.forEach((stav, ind) => stav.style.borderLeft = `5px solid ${i === ind ? '#B68181' : '#ddd'}`)
        stavke.forEach((stav, ind) => stav.style.backgroundColor = i === ind ? '#ddd' : '#fff')
        const helperi = document.getElementsByClassName('con-helper')
        for (let ind = 0; ind < helperi.length; ind++) {
            helperi[ind].style.display = ind === i ? 'block' : 'none'
        }
    })
}