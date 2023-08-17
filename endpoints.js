import { config } from "./config.js"

const { backUrl } = config

async function posaljiOdgovor(odgovor) {
    await fetch(`${backUrl}/odgovori`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(odgovor)
    })
}

async function vratiKorisnika(username) {
    const response = await fetch(`${backUrl}/korisnici?username=${username}`, {
        method: 'GET'
    })
    const korisnici = await response.json()
    return korisnici.length ? korisnici[0] : null
}
async function upisiKorisnika(username) {
    const response = await fetch(`${backUrl}/korisnici`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            akcije: []
        })
    })
    const korisnik = await response.json()
    return korisnik
}
// async function azurirajKorisnika(korisnik, novaAkcija) {
//     const id = korisnik ? korisnik.id : -1
//     // const korisnik = (await vratiKorisnika(username))
//     // const id = korisnik.id
//     const akcije = korisnik.akcije
//     akcije.push(novaAkcija)
//     const response = await fetch(`${backUrl}/korisnici/${id}`, {
//         method: 'PUT',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             id,
//             username: korisnik.username,
//             akcije
//         })
//     })
//     const azurniKorisnik = await response.json()
//     return azurniKorisnik
// }
async function azurirajKorisnika(username, novaAkcija) {
    // const id = korisnik ? korisnik.id : -1
    const korisnik = (await vratiKorisnika(username))
    const id = korisnik.id
    const akcije = korisnik.akcije
    akcije.push(novaAkcija)
    const response = await fetch(`${backUrl}/korisnici/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id,
            username,
            akcije
        })
    })
    const azurniKorisnik = await response.json()
    return azurniKorisnik
}

const laksiItem = document.getElementById('laksi-item')
const teziItem = document.getElementById('tezi-item')
async function izdvojUsername() {
    const cookies = document.cookie.split(';')
    const cookieUsername = cookies.find(cookie => cookie.split('=')[0].includes('username'))
    let username = cookieUsername ? cookieUsername.split('=')[1] : null
    if (username) {
        laksiItem.style.display = 'flex'
        teziItem.style.display = 'flex'
    }
    while(!username) {
        username = prompt('Unesite korisnicko ime kako bismo Vas pozdravili')
        document.cookie = `username=${username}; expires=${new Date(9999, 0, 1).toUTCString()}`
    }
    let korisnik = await vratiKorisnika(username)
    if (!korisnik) {
        korisnik = await upisiKorisnika(username)
    }
    
    return korisnik
}

function alertKviz() {
    alert('Od sada u meniju imate i opciju "Uradi kviz" odakle možete da otvorite i probate da uradite naše zadatke.')
}

const timeout = 10 * 60 * 1000

export { posaljiOdgovor, izdvojUsername, alertKviz, upisiKorisnika, vratiKorisnika, azurirajKorisnika, timeout }   