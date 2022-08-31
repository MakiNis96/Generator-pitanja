import { backUrl } from "./config.js"

async function posaljiOdgovor(odgovor) {
    await fetch(`${backUrl}/odgovori`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(odgovor)
    })
}

async function pribaviOdgovore(username) {
    const response = await fetch(`${backUrl}/odgovori?username=${username}`, {method: 'GET'})
    const odgovori = await response.json()
    return odgovori
}

function izdvojUsername() {
    const cookies = document.cookie.split(';')
    const cookieUsername = cookies.find(cookie => cookie.split('=')[0].includes('username'))
    let username = cookieUsername ? cookieUsername.split('=')[1] : null
    while(!username) {
        username = prompt('Unesite korisnicko ime')
        document.cookie = `username=${username}; expires=${new Date(9999, 0, 1).toUTCString()}`
    }
    return username
}

export { posaljiOdgovor, pribaviOdgovore, izdvojUsername }   