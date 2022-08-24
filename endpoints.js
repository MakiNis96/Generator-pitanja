import { backUrl } from "./config.js"

// async function getUserByIp(ip) {
//     const response = await fetch(`${backUrl}/users?ip=${ip}`, {method: 'GET'})
//     const users = await response.json()
//     return users.length === 0 ? null : users[0]
// }

// async function createUser(user) {
//     await fetch(`${backUrl}/users`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(user)
//     })
// }

// async function updateUser(id, user) {
//     await fetch(`${backUrl}/users/${id}`, {
//         method: 'PUT',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(user)
//     })
// }

// async function getAnswer(userId, taskId) {
//     const response = await fetch(`${backUrl}/answers?userId=${userId}&taskId=${taskId}`, {method: 'GET'})
//     const answers = await response.json()
//     return answers.length === 0 ? null : answers[0]
// }
// async function createAnswer(answer) {
//     await fetch(`${backUrl}/answers`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(answer)
//     })
// }

// async function updateAnswer(id, answer) {
//     await fetch(`${backUrl}/answers/${id}`, {
//         method: 'PUT',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(answer)
//     })
// }

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