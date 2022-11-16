import { config } from "./config.js"

const backUrl = `http://${config.backHost}:${config.backPort}`

async function posaljiOdgovor(odgovor) {
    await fetch(`${backUrl}/odgovori`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(odgovor)
    })
}

async function vratiVreme(username, stranica) {
    const response = await fetch(`${backUrl}/vreme?username=${username}&stranica=${stranica}`, {
        method: 'GET'
    })
    const vreme = await response.json()
    return vreme
}
async function upisiVreme(username, stranica, novoVreme) {
    await fetch(`${backUrl}/vreme`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            stranica,
            vreme: novoVreme
        })
    })
}
async function azurirajVreme(id, username, stranica, novoVreme) {
    await fetch(`${backUrl}/vreme/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id,
            username,
            stranica,
            vreme: novoVreme
        })
    })
}

function izdvojUsername() {
    const cookies = document.cookie.split(';')
    const cookieUsername = cookies.find(cookie => cookie.split('=')[0].includes('username'))
    let username = cookieUsername ? cookieUsername.split('=')[1] : null
    while(!username) {
        username = prompt('Unesite korisnicko ime kako bismo Vas pozdravili')
        document.cookie = `username=${username}; expires=${new Date(9999, 0, 1).toUTCString()}`
    }
    return username
}

function alertKviz() {
    alert('Od sada u meniju imate i opciju "Uradi kviz" odakle možete da otvorite i probate da uradite naše zadatke.')
}

const timeout = 10 * 1000

export { posaljiOdgovor, /*pribaviOdgovore,*/ izdvojUsername, alertKviz, upisiVreme, vratiVreme, azurirajVreme, timeout }   