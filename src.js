import { generisiPitanja, parseQuery } from './generator.js'
import { podaci } from './podaci.js'
import { CrtanjeHTMLElemenata } from './basic.js'
import { posaljiOdgovor, izdvojUsername, alertKviz, timeout, azurirajKorisnika, vratiKorisnika } from './endpoints.js'
import { zadaci } from './zadaci.js'

const contextMenu = document.getElementById('menu')
const sablon = document.getElementById('parametri')

let redniBrojParametra = 0
sablon.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    oznaciParametar(sablon, event)
})
sablon.onkeydown = event => spreciKeyDown(sablon, event)

function spreciKeyDown (sabl, event) {
    const selection = window.getSelection().getRangeAt(0)
    const startIndex = getIndexFromSelection(selection.startOffset, selection.startContainer.previousSibling, selection.startContainer.parentElement)
    const endIndex = getIndexFromSelection(selection.endOffset, selection.endContainer.previousSibling, selection.endContainer.parentElement)
    if (selection.startContainer.nodeName == 'em'
            || selection.endContainer.nodeName == 'em'
            || sabl.innerHTML.slice(startIndex, endIndex).includes('<em contenteditable="false"')
            || selection.startContainer.nodeName == 'i'
            || selection.endContainer.nodeName == 'i'
            || sabl.innerHTML.slice(startIndex, endIndex).includes('<i contenteditable="false"')
        ) {
        return false
    }
}

const opseg = document.getElementById('opseg')
const pojedinacneVrednosti = document.getElementById('pojedinacneVrednosti')
const postaviPojedinacne = document.getElementById('postaviPojedinacne')
const postaviOpseg = document.getElementById('postaviOpseg')
let idKliknutogParametra
sablon.addEventListener('click', (e) => {
    if (e.target.localName !== 'em') {
        return
    }
    const parametar = e.target.innerHTML
    const className = e.target.className
    idKliknutogParametra = Number(className.slice(2))
    postavljanjeAlternativaParametra(idKliknutogParametra, true)
})

// postavljanje zavisnosti
sablon.addEventListener('mouseover', (e) => {
    event.preventDefault()
    if (e.target.localName !== 'em') {
        return
    }
    const parametar = e.target.innerHTML
    const className = e.target.className
    const idTekucegParametra = Number(className.slice(2))

    const { clientX: mouseX, clientY: mouseY } = event
    contextMenu.style.top = `${mouseY}px`
    contextMenu.style.left = `${mouseX}px`

    prikazivanjeMenija(idTekucegParametra)
})
window.addEventListener('click', (e) => {
    if (e.target.offsetParent != contextMenu) {
      contextMenu.style.display = 'none'
    }
})

// const panelDodavanjeZavisnosti = document.querySelector('.panelDodavanjeZavisnosti')
function prikazZavisnosti(idParametra, vrednost) {
    document.getElementById('panelAlternative').style.display = 'none'
    const panel = document.getElementById('panelZavisnostiAlternative')
    panel.style.display = 'block'
    panel.innerHTML = ''
    const natpis = `Da li pojavljivanje teksta <em class='em${idParametra}'>
       ${vrednost.vrednost}</em> zavisi od pojavljivanja vrednosti nekih drugih parametara?`
    CrtanjeHTMLElemenata.nacrtajElement(panel, 'p', [], natpis)

    const radioDa = CrtanjeHTMLElemenata.nacrtajRadioInput(panel, 'zavisnost')
    CrtanjeHTMLElemenata.nacrtajElement(panel, 'label', [], 'Da')

    const radioNe = CrtanjeHTMLElemenata.nacrtajRadioInput(panel, 'zavisnost')
    CrtanjeHTMLElemenata.nacrtajElement(panel, 'label', [], 'Ne')

    if (vrednost.zavisnosti.length == 0 && !postojiZavisnost(idParametra, vrednost.id)) {
        radioNe.checked = true
        panelDodavanjeZavisnosti.style.display = 'none'
    } else {
        radioDa.checked = true
        panelDodavanjeZavisnosti.style.display = 'block'
        dodavanjeZavisnosti(idParametra, vrednost)
    }

    radioDa.addEventListener('change', () => {
        if (radioDa.checked) {
            panelDodavanjeZavisnosti.style.display = 'block'
            dodavanjeZavisnosti(idParametra, vrednost)
        } else {
            panelDodavanjeZavisnosti.style.display = 'none'
        }
    })

    radioNe.addEventListener('change', () => {
        if (radioNe.checked) {
            panelDodavanjeZavisnosti.style.display = 'none'
        } else {
            panelDodavanjeZavisnosti.style.display = 'block'
            dodavanjeZavisnosti(idParametra, vrednost)
        }
    })
}

function postojiZavisnost(idParametra, idVrednosti) {
    let postoji = false
    for (const parametar of podaci.parametriPitanja) {
        for(const vred of parametar.vrednosti) {
            for (const zavisnost of vred.zavisnosti) {
                if (zavisnost.idParametra === idParametra && zavisnost.idVrednosti === idVrednosti) {
                    postoji = true
                }
            }
        }
    }
    return postoji
}

const postojeceZavisnosti = document.getElementById('postojeceZavisnosti')
function dodavanjeZavisnosti(idParametra, vrednost) {
    postojeceZavisnosti.innerHTML = ''
    panelDodavanjeZavisnosti.id = `zavisnosti-parametar-${idParametra}-vrednost-${vrednost.id}`
    const natpisPitanje = `Tekst <em class='em${idParametra}'>${vrednost.vrednost}</em> se prikazuje kada: `
    CrtanjeHTMLElemenata.nacrtajElement(postojeceZavisnosti, 'p', [], natpisPitanje)

    // ispisivanje u disabled selekte
    for (const parametar of podaci.parametriPitanja) {
        for(const vred of parametar.vrednosti) {
            let postoji = {}
            for (const zavisnost of vred.zavisnosti) {
                if (zavisnost.idParametra === idParametra && zavisnost.idVrednosti === vrednost.id) {
                    postoji = {
                        idParametra: parametar.id,
                        idVrednosti: vred.id
                    }
                }
            }
            if (Object.keys(postoji).length !== 0) {
                const param = podaci.parametriPitanja.find(p => p.id === postoji.idParametra)
                const vredn = param.vrednosti.find(v => v.id === postoji.idVrednosti)
                const divZavisnosti = CrtanjeHTMLElemenata.nacrtajElement(postojeceZavisnosti, 'div')
                const selectParametri = CrtanjeHTMLElemenata.nacrtajElement(divZavisnosti, 'select', ['select-parametri', 'form-control'])
                selectParametri.disabled = true
                const vrednosti = param.vrednosti.reduce((total, v) => total + v.vrednost + ';', '')
                CrtanjeHTMLElemenata.nacrtajOption(selectParametri, vrednosti, postoji.idParametra, [`em${postoji.idParametra}`])
                
                CrtanjeHTMLElemenata.nacrtajElement(divZavisnosti, 'label', [], '&nbsp;ima vrednost&nbsp;')
                
                const selectVrednosti = CrtanjeHTMLElemenata.nacrtajElement(divZavisnosti, 'select', ['select-vrednosti', 'form-control'])
                selectVrednosti.disabled = true
                CrtanjeHTMLElemenata.nacrtajOption(selectVrednosti, vredn.vrednost, vredn.id)
                CrtanjeHTMLElemenata.nacrtajElement(divZavisnosti, 'label', [], '&nbsp;ili&nbsp;')
            }

        }
    }


    // ispisivanje vec dodatih
    for (const zavisnost of vrednost.zavisnosti) {
        const divZavisnosti = CrtanjeHTMLElemenata.nacrtajElement(postojeceZavisnosti, 'div')
        const selectParametri = CrtanjeHTMLElemenata.nacrtajElement(divZavisnosti, 'select', ['select-parametri', 'form-control'])
        for (const parametar of podaci.parametriPitanja) {
            if (parametar.id != idParametra) {
                const vrednosti = parametar.vrednosti.reduce((total, vrednost) => total + vrednost.vrednost + ';', '')
                CrtanjeHTMLElemenata.nacrtajOption(selectParametri, vrednosti, parametar.id, [`em${parametar.id}`])
            }
        }
        selectParametri.value = zavisnost.idParametra
        CrtanjeHTMLElemenata.nacrtajElement(divZavisnosti, 'label', [], '&nbsp;ima vrednost&nbsp;')
        const selectVrednosti = CrtanjeHTMLElemenata.nacrtajElement(divZavisnosti, 'select', ['select-vrednosti', 'form-control'])
        const parametarZavisnost = podaci.parametriPitanja.find(param => param.id == zavisnost.idParametra)
        for (const vrednost of parametarZavisnost.vrednosti) {
            CrtanjeHTMLElemenata.nacrtajOption(selectVrednosti, vrednost.vrednost, vrednost.id)
        }
        selectVrednosti.value = zavisnost.idVrednosti

        const btnObrisi = CrtanjeHTMLElemenata.nacrtajElement(divZavisnosti, 'i', ['fa', 'fa-trash'])
        btnObrisi.addEventListener('click', () => {
            divZavisnosti.remove()
        })

        CrtanjeHTMLElemenata.nacrtajElement(divZavisnosti, 'label', [], '&nbsp;ili&nbsp;')

        selectParametri.addEventListener('change', () => {
            selectVrednosti.innerHTML = ''
            const idParam = selectParametri.value
            const parametar = podaci.parametriPitanja.find(param => param.id == idParam)
            for (const vrednost of parametar.vrednosti) {
                CrtanjeHTMLElemenata.nacrtajOption(selectVrednosti, vrednost.vrednost, vrednost.id)
            }
        })
    }

    // const btnZapamtiZavisnosti = document.getElementById('zapamtiZavisnosti')
    // btnZapamtiZavisnosti.idParametra = idParametra
    // btnZapamtiZavisnosti.idVrednosti = vrednost.id
    // btnZapamtiZavisnosti.addEventListener('click', event => {
    //     zapamtiZavisnosti(event.currentTarget.idParametra, event.currentTarget.idVrednosti)
    // }) 
}
document.getElementById('plusNovaZavisnost').addEventListener('click', nacrtajInputNoveZavisnosti)
function nacrtajInputNoveZavisnosti() {
    const postojeceZavisnostiDiv = document.getElementById('postojeceZavisnosti')
    const divZavisnost = CrtanjeHTMLElemenata.nacrtajElement(postojeceZavisnostiDiv, 'div')

    const idParametra = Number(panelDodavanjeZavisnosti.id.slice(21, panelDodavanjeZavisnosti.id.indexOf('-vrednost-')))

    const selectParametri = CrtanjeHTMLElemenata.nacrtajElement(divZavisnost, 'select', ['select-parametri', 'form-control'])
    CrtanjeHTMLElemenata.nacrtajOption(selectParametri, '--', '-') // default option --
    for (const parametar of podaci.parametriPitanja) {
        if (parametar.id != idParametra) {
            const vrednosti = parametar.vrednosti.reduce((total, vred) => total + vred.vrednost + ';', '')
            CrtanjeHTMLElemenata.nacrtajOption(selectParametri, vrednosti, parametar.id, [`em${parametar.id}`])
        }
    }
    CrtanjeHTMLElemenata.nacrtajElement(divZavisnost, 'label', [], '&nbsp;ima vrednost&nbsp;')

    const selectVrednosti = CrtanjeHTMLElemenata.nacrtajElement(divZavisnost, 'select', ['select-vrednosti', 'form-control'])
    CrtanjeHTMLElemenata.nacrtajOption(selectVrednosti, '--', '-') // default option --

    selectParametri.addEventListener('change', () => {
        selectVrednosti.innerHTML = ''
        const idParam = selectParametri.value
        const parametar = podaci.parametriPitanja.find(param => param.id == idParam)
        for (const vrednost of parametar.vrednosti) {
            CrtanjeHTMLElemenata.nacrtajOption(selectVrednosti, vrednost.vrednost, vrednost.id)
        }
    })

    CrtanjeHTMLElemenata.nacrtajElement(divZavisnost, 'label', [], '&nbsp; ili &nbsp;')
    const btnObrisi = CrtanjeHTMLElemenata.nacrtajElement(divZavisnost, 'i', ['fa', 'fa-trash'])
    btnObrisi.addEventListener('click', () => {
        divZavisnost.remove()
    })
}

const btnZapamtiZavisnosti = document.getElementById('zapamtiZavisnosti')
btnZapamtiZavisnosti.addEventListener('click', event => {
    const idParametra = Number(panelDodavanjeZavisnosti.id.slice(21, panelDodavanjeZavisnosti.id.indexOf('-vrednost-')))
    const idVrednosti = Number(panelDodavanjeZavisnosti.id.slice(panelDodavanjeZavisnosti.id.indexOf('vrednost-') + 9))
    zapamtiZavisnosti(idParametra, idVrednosti)
})

// za zavisnosti ne pamtim id-jeve
function zapamtiZavisnosti (idParametra, idVrednosti) {
    // samo upisem trenutno postavljene zavisnosti
    const selektovaniParametri = document.getElementsByClassName('select-parametri')
    const selektovaneVrednosti = document.getElementsByClassName('select-vrednosti')
    const zavisnosti = []
    // let nijeUnetaZavisnost = false
    for (let i = 0; i < selektovaniParametri.length; i++) {
        if (selektovaniParametri[i].value != '--' && !selektovaniParametri[i].disabled) {
            const novaZavisnost = {
                idParametra: Number(selektovaniParametri[i].value),
                idVrednosti: Number(selektovaneVrednosti[i].value)
            }
            if (!zavisnosti.includes(novaZavisnost)) {
                zavisnosti.push(novaZavisnost)
            }
        } /*else {
            nijeUnetaZavisnost = true
        }*/
    }
    // if (nijeUnetaZavisnost) {
    if (zavisnosti.length === 0) {
        alert('Niste ispravno uneli zavisnosti')
        return
    }
    const parametar = podaci.parametriPitanja.find(param => param.id == idParametra)
    const parametarIndex = podaci.parametriPitanja.indexOf(parametar)
    const vrednost = parametar.vrednosti.find(vrednost => vrednost.id == idVrednosti)
    const vrednostIndex = parametar.vrednosti.indexOf(vrednost)
    podaci.parametriPitanja[parametarIndex].vrednosti[vrednostIndex] = {
        ...vrednost,
        zavisnosti
    }
    alert('Sacuvano')
}

let idSablonaOdgovora = 0
const btnDodajSablon = document.getElementById('dodajSablonOdgovora')
const kontejnerSablonaOdgovora = document.getElementById('kontejnerSablonaOdgovora')
btnDodajSablon.addEventListener('click', dodajSablonOdgovora)

let ucitavanjeModela = false
function dodajSablonOdgovora(id, sablon) {
    // id i sablon postoje ako je ucitavanje postojeceg modela pitanja
    if (ucitavanjeModela) {
       kontejnerSablonaOdgovora.innerHTML = ''
       ucitavanjeModela = false
    }
    const konSablonOdgovora = CrtanjeHTMLElemenata.nacrtajElement(kontejnerSablonaOdgovora, 'div')
    const divSablonOdgovora = CrtanjeHTMLElemenata.nacrtajElement(konSablonOdgovora, 'div', ['konSablonOdg'])
    divSablonOdgovora.style.display = 'flex'
    const sablonOdgovora = CrtanjeHTMLElemenata.nacrtajContenteditableDiv(divSablonOdgovora, `sablonOdgovora${id && sablon ? id : ++idSablonaOdgovora}`, ['sablonOdgovora'])
    sablonOdgovora.addEventListener("paste", (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand("insertHTML", false, text);
    });
    if (sablon) {
        sablonOdgovora.innerHTML = sablon
    }
    const btnObrisi = CrtanjeHTMLElemenata.nacrtajElement(divSablonOdgovora, 'i', ['fa', 'fa-trash'])
    CrtanjeHTMLElemenata.nacrtajElement(konSablonOdgovora, 'br')

    sablonOdgovora.addEventListener('contextmenu', (event) => {
        event.preventDefault()
        oznaciParametar(sablonOdgovora, event)
    })
    sablonOdgovora.onkeydown = event => spreciKeyDown(sablonOdgovora, event)

    sablonOdgovora.addEventListener('click', (e) => {
        if (e.target.localName !== 'em') {
            return
        }
        // const parametar = e.target.innerHTML
        const className = e.target.className
        const idKliknutogParametra = Number(className.slice(2))
        postavljanjeAlternativaParametra(idKliknutogParametra, false)
    })
    sablonOdgovora.addEventListener('mouseover', (e) => {
        event.preventDefault()
        if (e.target.localName !== 'em') {
            return
        }
        // const parametar = e.target.innerHTML
        const className = e.target.className
        const idKliknutogParametra = Number(className.slice(2))
        const idSablonaOdg = Number(sablonOdgovora.id.slice(14))
    
        const { clientX: mouseX, clientY: mouseY } = event
        contextMenu.style.top = `${mouseY}px`
        contextMenu.style.left = `${mouseX}px`
    
        prikazivanjeMenija(idKliknutogParametra, idSablonaOdg)
    })

    btnObrisi.addEventListener('click', function () {
        // ako sablon odgovora sadrzi neki parametar ne moze se obrisati
        if (sablonOdgovora.innerHTML.indexOf('<em class=') > -1) {
            alert('Sablon odgovora se ne moze obrisati, jer sadrzi delove za variranje!')
            return
        }
        const idSablona = Number(sablonOdgovora.id.slice(14))
        podaci.sabloniOdgovora = podaci.sabloniOdgovora.filter(sablon => sablon.id != idSablona)
        konSablonOdgovora.remove()
    })
}

document.getElementById('btnGenerisi').addEventListener('click', () => {
    // podaci.sablonPitanja = ''
    // podaci.sabloniOdgovora = []
    // // ISPRAVKA - dodatak za vise redova - .replace(/<div>/g, '\r\n').replace(/<\/div>/g, '')
    // let sablonText = sablon.innerHTML.replace(/&nbsp;/g, ' ').replace(/<div>/g, '\r\n').replace(/<\/div>/g, '')
    // podaci.sablonPitanja = kreirajSablon(sablonText)
    // const sabloniOdgovora = document.getElementsByClassName('sablonOdgovora')
    // for (const sablonOdgovora of sabloniOdgovora) {
    //     let sablonOdgovoraText = sablonOdgovora.innerHTML.replace(/&nbsp;/g, ' ').replace(/<div>/g, '\r\n').replace(/<\/div>/g, '')
    //     sablonOdgovoraText = kreirajSablon(sablonOdgovoraText)
    //     podaci.sabloniOdgovora.push({
    //         id: Number(sablonOdgovora.id.slice(14)),
    //         sablon: sablonOdgovoraText
    //     })
    // }
    document.getElementById('rezultat').innerHTML = ''
    zapamtiSablone()
    generisiPitanja()
    document.getElementById('podsetikZaSlanje').style.display = 'block'
})
function zapamtiSablone () {
    podaci.sablonPitanja = ''
    podaci.sabloniOdgovora = []
    // ISPRAVKA - dodatak za vise redova - .replace(/<div>/g, '\r\n').replace(/<\/div>/g, '')
    // let sablonText = sablon.innerHTML.replace(/&nbsp;/g, ' ').replace(/<div>/g, '\r\n').replace(/<\/div>/g, '')
    let sablonText = sablon.innerHTML
    podaci.sablonPitanja = kreirajSablon(sablonText)
    const sabloniOdgovora = document.getElementsByClassName('sablonOdgovora')
    for (const sablonOdgovora of sabloniOdgovora) {
        // let sablonOdgovoraText = sablonOdgovora.innerHTML.replace(/&nbsp;/g, ' ').replace(/<div>/g, '\r\n').replace(/<\/div>/g, '')
        let sablonOdgovoraText = sablonOdgovora.innerHTML
        sablonOdgovoraText = kreirajSablon(sablonOdgovoraText)
        podaci.sabloniOdgovora.push({
            id: Number(sablonOdgovora.id.slice(14)),
            sablon: sablonOdgovoraText
        })
    }
}
function kreirajSablon(sablonText) {
    const vrednostiZaZamenu = [] // u ovaj niz pamtim vrednost i indeks
    let posStart = sablonText.indexOf('<em contenteditable="false" class=')
    let posEnd = sablonText.indexOf('</em>')
    while (posStart > -1) {
        let vred = sablonText.substring(posStart, posEnd + 5)
        vrednostiZaZamenu.push({
            vrednost: vred,
            indeks: Number(vred.slice(37, vred.indexOf('">'))) // da radi za visecifrene
            // indeks: Number(sablonText[posStart + 37])
        })
        posStart = sablonText.indexOf('<em contenteditable="false" class=', posEnd + 5)
        posEnd = sablonText.indexOf('</em>', posEnd + 5)
    }
    for (let i = 0; i < vrednostiZaZamenu.length; i++) {
        const vrednost = vrednostiZaZamenu[i].vrednost
        const indeks = vrednostiZaZamenu[i].indeks
        sablonText = sablonText.replace(vrednost, `<p${indeks}>`)
    }
    return sablonText
}

const panelAlternative = document.getElementById('panelAlternative')
const panelZavisnostiAlternative = document.getElementById('panelZavisnostiAlternative')
const panelDodavanjeZavisnosti = document.querySelector('.panelDodavanjeZavisnosti')
const panelKriterijumiTacnosti = document.getElementById('panelKriterijumiTacnosti')

let indikatorBrisanje = false
function oznaciParametar(div, event) { // ovo se poziva i za sablon pitanja i za sablone odgovora
    const sablonValue = div.innerHTML.replace(/&nbsp;/g, ' ')
    const selection = window.getSelection().getRangeAt(0)

    const idSelectovanog = div.id
    const pitanjeFleg = idSelectovanog == 'parametri' ? true : false
    const idSablona = idSelectovanog == 'parametri' ? 0 : Number(idSelectovanog.slice(14))

    contextMenu.style.display = 'block'
    const { clientX: mouseX, clientY: mouseY } = event
    contextMenu.style.top = `${mouseY}px`
    contextMenu.style.left = `${mouseX}px`
    contextMenu.innerHTML = ''
    contextMenu.style.minWidth = '400px'
    
    if (event.target.localName == 'em' && selection.startOffset == selection.endOffset && Object.is(selection.startContainer, selection.endContainer)) {
        // ako je kliknut postojeci parametar - opcija za brisanje
        const vrednostParametra = event.target.innerHTML
        const className = event.target.className
        const idTekucegParametra = Number(className.slice(2))

        const postojiReferenca = postojiReferencaParametra(idTekucegParametra)
        if (postojiReferenca) {
            const natpis = 'Nije moguce obrisati deo pitanja za variranje'
            CrtanjeHTMLElemenata.nacrtajElement(contextMenu, 'li', ['btn', 'bojaUpozorenje'], natpis)
        } else {
            // moguce brisanje
            const natpis = 'Obrisi deo pitanja za variranje'
            const btnObrisi = CrtanjeHTMLElemenata.nacrtajElement(contextMenu, 'li', ['btn'], natpis)

            btnObrisi.addEventListener('click', () => {
                contextMenu.style.display = 'none'
                // brise mu se em tag i brise se iz podaci.parametriPitanja
                event.target.outerHTML = vrednostParametra
                const sabloniOdgovora = document.getElementsByClassName('sablonOdgovora')
                const sablonPitanja = document.getElementById('parametri')
                // ako se obrise kloniran - onda ne treba da se nista drugo menja - brise se samo ta jedna kopija, ne ostale (parametar i dalje postoji)
                // provera da li je kloniran - da li se javlja jos u nekom sablonu
                let jeKloniran = false
                if (sablonPitanja.innerHTML.indexOf(`<em contenteditable="false" class="${className}">${vrednostParametra}</em>`) > -1) {
                    jeKloniran = true
                }
                for (const sablonOdgovora of sabloniOdgovora) {
                    if (sablonOdgovora.innerHTML.indexOf(`<em contenteditable="false" class="${className}">${vrednostParametra}</em>`) > -1) {
                        jeKloniran = true
                    }
                }
                if (!jeKloniran) {
                    // brisem iz podaci parametar po id-ju
                    podaci.parametriPitanja = podaci.parametriPitanja.filter(param => param.id != idTekucegParametra)
                }

                panelAlternative.style.display = 'none'
                panelZavisnostiAlternative.style.display = 'none'
                panelDodavanjeZavisnosti.style.display = 'none'
                panelKriterijumiTacnosti.style.display = 'none'
            })
        }
        return
    }
    if (event.target.localName == 'i' && selection.startOffset == selection.endOffset && Object.is(selection.startContainer, selection.endContainer)) {
        // ako je kliknut vec oznaceni deo za evaluaciju - opcija za brisanje
        const deoEvaluacija = event.target.innerHTML
        const natpis = 'Ponisti deo odgovora za evaluaciju'
        const btnObrisi = CrtanjeHTMLElemenata.nacrtajElement(contextMenu, 'li', ['btn'], natpis)
        btnObrisi.addEventListener('click', () => {
            contextMenu.style.display = 'none'
            // brise mu se <i> tag
            const noviSablon = div.innerHTML.replace(`<i contenteditable="false" style="color:red">${deoEvaluacija}</i>`, deoEvaluacija)
            div.innerHTML = noviSablon
        })

        return
    }
    if (selection.startOffset == selection.endOffset && Object.is(selection.startContainer, selection.endContainer)) {
        // ubacivanje postojeceg parametra
        let startIndex = 0
        if (selection.startContainer.children) {
            startIndex = selection.startContainer.outerHTML.length// - 1
        } else {
            startIndex = getIndexFromSelection(selection.startOffset, selection.startContainer.previousSibling, selection.startContainer.parentElement)
        }

        for (const parametar of podaci.parametriPitanja) {
            if (parametar.pitanje) {
                const vrednostiParametra = parametar.vrednosti.reduce((total, element) => total + element.vrednost + ';' , '')
                const li = CrtanjeHTMLElemenata.nacrtajElement(contextMenu, 'li', [`em${parametar.id}`])
                CrtanjeHTMLElemenata.nacrtajRadioInput(li, 'ubaciPostojeci', `ubaciPostojeci${parametar.id}`)
                CrtanjeHTMLElemenata.nacrtajElement(li, 'label', [], vrednostiParametra)
            }
        }

        const natpis = 'Ubaci postojeci deo pitanja za variranje'
        const li = CrtanjeHTMLElemenata.nacrtajElement(contextMenu, 'li', ['liDugme', 'menu-item'], natpis)
        li.addEventListener('click', () => {
            contextMenu.style.display = 'none'
            const checkedRadio = document.querySelector('input[name="ubaciPostojeci"]:checked')
            if (checkedRadio) {
                // ubacivanje cekiranog parametra
                const izabraniParametarId = Number(checkedRadio.id.slice(14))
                const parametarZaUbacivanje = podaci.parametriPitanja.find(param => param.id == izabraniParametarId)
                const vrednostZaUbacivanje = parametarZaUbacivanje.vrednosti.find(el => el.default == true).vrednost
                const ubacivanje = `<em contenteditable="false" class='em${izabraniParametarId}'>${vrednostZaUbacivanje}</em> `
                div.innerHTML = `${sablonValue.substring(0, startIndex)}${ubacivanje}${sablonValue.substring(startIndex)}`
            }       
        })

        return
    }

    // oznacavanje novog parametra
    if (pitanjeFleg || !sadrziParametarOdgovora(sablonValue)) {
        const natpis = `Oznaci deo ${pitanjeFleg ? 'pitanja' : 'odgovora'} za variranje`
        const btnOznaci = CrtanjeHTMLElemenata.nacrtajElement(contextMenu, 'li', ['btn'], natpis)

        btnOznaci.addEventListener('click', (e) => { // oznacavanje parametra
            contextMenu.style.display = 'none'
            let greskaEval = false, greskaParametar = false
            if (selection.startContainer.parentElement.localName == 'i' || selection.endContainer.parentElement.localName == 'i') {
                greskaEval = true
            }
            if (selection.startContainer.parentElement.localName == 'em' || selection.endContainer.parentElement.localName == 'em') {
                greskaParametar = true
            }
            const startIndex = getIndexFromSelection(selection.startOffset, selection.startContainer.previousSibling, selection.startContainer.parentElement)
            const endIndex = getIndexFromSelection(selection.endOffset, selection.endContainer.previousSibling, selection.endContainer.parentElement) 
            const selectedPart = sablonValue.substring(startIndex, endIndex)
            if (selectedPart.indexOf('<i contenteditable="false" style="color:red">') > -1 || selectedPart.indexOf('</i>') > -1) {
                greskaEval = true
            }
            if (selectedPart.indexOf('<em contenteditable="false" class=') > -1 || selectedPart.indexOf('</em>') > -1) {
                greskaParametar = true
            }
            if (greskaEval) {
                alert('Selektovani deo sadrzi deo za evaluaciju i ne moze biti oznacen kao deo za variranje')
                return
            }
            if (greskaParametar) {
                alert('Selektovani deo vec sadrzi deo za variranje')
                return
            }
            div.innerHTML = `${sablonValue.substring(0, startIndex)}<em contenteditable="false" class='em${redniBrojParametra}'>${selectedPart}</em>${sablonValue.substring(endIndex)}`

            podaci.parametriPitanja.push({
                id: redniBrojParametra,
                pitanje: pitanjeFleg,
                opseg: false,
                od: 0,
                do: 0,
                korak: 0,
                vrednosti: [{
                    id: 0,
                    vrednost: selectedPart,
                    zavisnosti: [],
                    default: true
                }]
            })
            redniBrojParametra++
        })
    }

    // oznacavanje dela odgovora za evaluaciju
    if (idSelectovanog != 'parametri' && selection.startContainer.parentElement.localName != 'em'
     && selection.startContainer.parentElement.localName != 'i'
     && selection.endContainer.parentElement.localName != 'em'
     && selection.endContainer.parentElement.localName != 'i'
     ) {
        contextMenu.style.width = '320px'
        const natpis = 'Oznaci deo odgovora koji treba da se evaluira'
        const btnEvaluacija = CrtanjeHTMLElemenata.nacrtajElement(contextMenu, 'li', ['btn'], natpis)
        btnEvaluacija.addEventListener('click', (e) => {
            contextMenu.style.display = 'none'
            const startIndex = getIndexFromSelection(selection.startOffset, selection.startContainer.previousSibling, selection.startContainer.parentElement)
            const endIndex = getIndexFromSelection(selection.endOffset, selection.endContainer.previousSibling, selection.endContainer.parentElement)
            const selectedPart = sablonValue.substring(startIndex, endIndex)
            if (selectedPart.indexOf('<i contenteditable="false" style="color:red">') > -1) {
                alert('Selektovani deo vec sadrzi deo koji treba da se evaluira')
                return
            }
            div.innerHTML = `${sablonValue.substring(0, startIndex)}<i contenteditable="false" style="color:red">${selectedPart}</i>${sablonValue.substring(endIndex)}`
        })
    }
}

function sadrziParametarOdgovora (divSablonOdgovora) { // proverava da li sablon odgovora vec sadrzi parametar odgovora 
    let start = divSablonOdgovora.indexOf('<em contenteditable="false" class="em')
    let sadrzi = false
    while (start > -1 && !sadrzi) {
        let end = divSablonOdgovora.indexOf('">', start)
        // const idParam = divSablonOdgovora.substring(start + 13, end)
        const idParam = divSablonOdgovora.substring(start + 37, end)
        sadrzi = !podaci.parametriPitanja.find(param => param.id === Number(idParam)).pitanje
        start = divSablonOdgovora.indexOf('<em contenteditable="false" class="em', end)
    }
    return sadrzi
}

const btnZapamtiPojedinacneVrednosti = document.getElementById('zapamtiPojedinacneVrednosti')
const opsegZapamti = document.getElementById('opsegZapamti')
const defaultAlternativa = document.getElementById('defaultAlternativa')
const odInput = document.getElementById('od')
const doInput = document.getElementById('do')
const korakInput = document.getElementById('korak')
function postavljanjeAlternativaParametra(idParametra, pitanjeFleg) {
    const parametar = podaci.parametriPitanja.find(param => param.id == idParametra)
    const defAlternativa = parametar.vrednosti.find(vred => vred.default == true)
    panelZavisnostiAlternative.innerHTML = ''
    panelDodavanjeZavisnosti.style.display = 'none'
    panelKriterijumiTacnosti.style.display = 'none'
    defaultAlternativa.innerHTML = defAlternativa.vrednost
    defaultAlternativa.className = `em${idParametra}`
    panelAlternative.style.display = 'block'
    const postojeceAlternativeDiv = document.getElementById('postojeceAlternative')

    if (parametar.opseg) {
        // opseg
        opseg.style.display = 'block'
        pojedinacneVrednosti.style.display = 'none'
        postaviOpseg.checked = true

        odInput.value = parametar.od
        doInput.value = parametar.do
        korakInput.value = parametar.korak
    } else {
        // pojedinacne vrednosti
        opseg.style.display = 'none'
        pojedinacneVrednosti.style.display = 'block'
        postaviPojedinacne.checked = true
        postojeceAlternativeDiv.innerHTML = ''

        for (const vred of parametar.vrednosti) {
            if (vred.default == false) { // defaultnu ne izlistavam, ona ne moze da se brise niti menja
                const divAlternativa = CrtanjeHTMLElemenata.nacrtajElement(postojeceAlternativeDiv, 'div', ['divAlternativa'])
                CrtanjeHTMLElemenata.nacrtajInput(divAlternativa, vred.vrednost, ['alternativaInput'], `alternativa-${vred.id}`)
                const brisanje = CrtanjeHTMLElemenata.nacrtajElement(divAlternativa, 'i', ['fa', 'fa-trash'])
                brisanje.addEventListener('click', () => {
                    // ako kliknuta vrednost ucestvuje u zavisnostima nekih drugih parametara - ne moze da se obrise
                    const postojiReferenca = postojiReferencaAlternative(idParametra, vred.id)
                    if (postojiReferenca) {
                        // ako vec ne sadrzi labelu, da se ne bi dupliralo upozorenje
                        const postojiUpozorenje = Array.from(divAlternativa.childNodes).find(child => child.localName == 'label') ? true : false
                        if (!postojiUpozorenje) {
                            const natpis = 'Nije moguce obrisati alternativu'
                            CrtanjeHTMLElemenata.nacrtajElement(divAlternativa, 'label', ['bojaUpozorenje'], natpis)
                        }
                    } else { // brisanje 
                        divAlternativa.remove()
                    }
                })
            }
        }
        
        odInput.value = defAlternativa.vrednost
        doInput.value = ''
        korakInput.value = ''
    }

    // const btnZapamtiPojedinacneVrednosti = document.getElementById('zapamtiPojedinacneVrednosti')
    btnZapamtiPojedinacneVrednosti.idParametra = idParametra
    // btnZapamtiPojedinacneVrednosti.addEventListener('click', event => {
    //     zapamtiPojedinacneVrednosti(event.currentTarget.idParametra)
    // })

    postaviPojedinacne.addEventListener('change', () => {
        if (postaviPojedinacne.checked) {
            opseg.style.display = 'none'
            pojedinacneVrednosti.style.display = 'block'
        }
    })

    postaviOpseg.idParametra = idParametra
    postaviOpseg.addEventListener('change', event => {
        if (postaviOpseg.checked) {
            const idParam = event.currentTarget.idParametra
            const parametar = podaci.parametriPitanja.find(param => param.id == idParam)
            const vrednost = parametar.vrednosti.find(vred => vred.default == true).vrednost
            if (!isNaN(vrednost)) {
                pojedinacneVrednosti.style.display = 'none'
                opseg.style.display = 'block'
            } else {
                postaviOpseg.checked = false
                postaviPojedinacne.checked = true
                alert('Nije moguce postaviti opseg za vrednost koja nije broj!')
            }
        }
    })

    // const opsegZapamti = document.getElementById('opsegZapamti')
    opsegZapamti.idParametra = idParametra
    opsegZapamti.pitanjeFleg = pitanjeFleg
    // opsegZapamti.addEventListener('click', (e) => {
    //     const idParametra = e.currentTarget.idParametra
    //     const od = Number(document.getElementById('od').value)
    //     const doOpseg = Number(document.getElementById('do').value)
    //     const korak = Number(document.getElementById('korak').value)

    //     const vrednosti = []
    //     for (let v = od; v < doOpseg; v += korak) {
    //         const defaultFleg = v == od ? true : false
    //         vrednosti.push({
    //             vrednost: v.toString(),
    //             default: defaultFleg,
    //             zavisnosti: []
    //         })
    //     }
    //     podaci.parametriPitanja = podaci.parametriPitanja.map(param => {
    //         return param.id == idParametra
    //             ? {
    //                 id: idParametra,
    //                 opseg: true,
    //                 od,
    //                 do: doOpseg,
    //                 korak,
    //                 vrednosti,
    //                 pitanje: pitanjeFleg
    //             }
    //             : param
    //     })
    //     alert('Sacuvano')
    // })
}

btnZapamtiPojedinacneVrednosti.addEventListener('click', event => {
    zapamtiPojedinacneVrednosti(event.currentTarget.idParametra)
})
opsegZapamti.addEventListener('click', (e) => {
    const idParametra = e.currentTarget.idParametra
    const pitanjeFleg = e.currentTarget.pitanjeFleg
    const od = Number(odInput.value)
    const doOpseg = Number(doInput.value)
    const korak = Number(korakInput.value)

    const vrednosti = []
    for (let v = od; v <= doOpseg; v += korak) {
        const defaultFleg = v == od ? true : false
        vrednosti.push({
            vrednost: v.toString(),
            default: defaultFleg,
            zavisnosti: []
        })
    }
    podaci.parametriPitanja = podaci.parametriPitanja.map(param => {
        return param.id == idParametra
            ? {
                id: idParametra,
                opseg: true,
                od,
                do: doOpseg,
                korak,
                vrednosti,
                pitanje: pitanjeFleg
            }
            : param
    })
    alert('Sacuvano')
})

document.getElementById('plusNovaAlternativa').addEventListener('click', nacrtajInputNoveAlternative)
function nacrtajInputNoveAlternative() {
    const postojeceAlternativeDiv = document.getElementById('postojeceAlternative')
    const divAlternativa = CrtanjeHTMLElemenata.nacrtajElement(postojeceAlternativeDiv, 'div', ['divAlternativa'])
    CrtanjeHTMLElemenata.nacrtajInput(divAlternativa, '', ['novaAlternativaInput'], '', 'Uneti novu alternativu')
    const brisanje = CrtanjeHTMLElemenata.nacrtajElement(divAlternativa, 'i', ['fa', 'fa-trash'])
    brisanje.addEventListener('click', () => {
        divAlternativa.remove()
    })
}

function postojiReferencaAlternative(idParametra, idVrednosti) {
    let postojiReferenca = false
    // u zavisnostima
    for (const parametar of podaci.parametriPitanja) {
        for (const vrednost of parametar.vrednosti) {
            for (const zavisnost of vrednost.zavisnosti) {
                if (zavisnost.idParametra == idParametra && zavisnost.idVrednosti == idVrednosti) {
                    postojiReferenca = true
                }
            }
        }
    }
    // u kriterijumima tacnosti i uslovu kriterijuma tacnosti
    let i = 0
    while (i < podaci.kriterijumiTacnosti.length && !postojiReferenca) {
        const kriterijumTacnosti = podaci.kriterijumiTacnosti[i]
        if (kriterijumTacnosti.idParametra == idParametra && kriterijumTacnosti.idVrednosti == idVrednosti) {
            postojiReferenca = true
        }
        const uslov = parseQuery(kriterijumTacnosti.uslov)
        if (uslov != '') {
            const deloviUslova = uslov.split(' ')
            for (const deoUslova of deloviUslova) {
                if (deoUslova.includes(':')) {
                    const idParam = parseInt(deoUslova.split(':')[0])
                    const idVred = parseInt(deoUslova.split(':')[1])
                    if (idParam == idParametra && idVred == idVrednosti) {
                        postojiReferenca = true
                    }
                }
            }
        }
        i++
    }
    return postojiReferenca
}

function postojiReferencaParametra(idParametra) {
    // moze da se obrise i ako ima vrednosti
    // ne moze da se obrise ako postoji referenca na neku njegovu vrednost
    let postojiReferenca = false
    // u zavisnostima
    for (const parametar of podaci.parametriPitanja) {
        for (const vrednost of parametar.vrednosti) {
            for (const zavisnost of vrednost.zavisnosti) {
                if (zavisnost.idParametra == idParametra) {
                    postojiReferenca = true
                }
            }
        }
    }
    // u kriterijumima tacnosti i uslovu kriterijuma tacnosti
    let i = 0
    while (i < podaci.kriterijumiTacnosti.length && !postojiReferenca) {
        const kriterijumTacnosti = podaci.kriterijumiTacnosti[i]
        if (kriterijumTacnosti.idParametra == idParametra) {
            postojiReferenca = true
        }
        const uslov = parseQuery(kriterijumTacnosti.uslov)
        if (uslov != '') {
            const deloviUslova = uslov.split(' ')
            for (const deoUslova of deloviUslova) {
                if (deoUslova.includes(':')) {
                    const idParam = parseInt(deoUslova.split(':')[0])
                    if (idParam == idParametra) {
                        postojiReferenca = true
                    }
                }
            }
        }
        i++
    }
    return postojiReferenca
}

function zapamtiPojedinacneVrednosti (idParametra) {
    const parametar = podaci.parametriPitanja.find(param => param.id == idParametra)
    const indexParametra = podaci.parametriPitanja.indexOf(parametar)
    let idPoslednje = parametar.vrednosti[parametar.vrednosti.length - 1].id
    const noveAlternative = []
    // defaultna se ne menja
    noveAlternative.push(parametar.vrednosti.find(vred => vred.default == true))
    for (const vrednost of parametar.vrednosti) {
        const alternativaInput = document.getElementById(`alternativa-${vrednost.id}`)
        if (alternativaInput) { // azuriranje
            noveAlternative.push({
                ...vrednost,
                vrednost: alternativaInput.value
            })
        }
        // ako ne postoji, onda je obrisan
    }
    // dodajem nove unete
    const noveAlt = document.getElementsByClassName('novaAlternativaInput')
    for (const novaAlt of noveAlt) {
        idPoslednje++
        novaAlt.id = `alternativa-${idPoslednje}`
        novaAlt.classList.add('alternativaInput')
        noveAlternative.push({
            id: idPoslednje,
            default: false,
            vrednost: novaAlt.value,
            zavisnosti: []
        })
    }
    const noveAltBrisanjeKlase = document.getElementsByClassName('alternativaInput')
    for (const novaAltBrisanjeKlase of noveAltBrisanjeKlase) {
        novaAltBrisanjeKlase.classList.remove('novaAlternativaInput')
    }
    const postojeceAlternativeInputi = document.querySelectorAll('#postojeceAlternative input')
    for (const postojecaAlternativaInput of postojeceAlternativeInputi) {
        postojecaAlternativaInput.classList.add('alternativaInput')
    }
    podaci.parametriPitanja[indexParametra].vrednosti = noveAlternative
    alert('Sacuvano')
}

const builder = document.getElementById('builder')

function prikazivanjeMenija(idParametra, idSablona) { // idSablona samo ako se radi o sablonima odgovora
    const parametar = podaci.parametriPitanja.find(param => param.id == idParametra)
    contextMenu.style.display = 'block'
    contextMenu.innerHTML = ''
    for (const vrednost of parametar.vrednosti) {
        const li = CrtanjeHTMLElemenata.nacrtajElement(contextMenu, 'li', ['menu-item'])
        li.style.width = '90%'
        li.style.height = '100%'
        li.style.display = 'flex'
        const radioInput = CrtanjeHTMLElemenata.nacrtajRadioInput(li, 'defaultAlternativa', '', vrednost.id)
        radioInput.checked = vrednost.default
        const divVrednost = CrtanjeHTMLElemenata.nacrtajElement(li, 'div', [], vrednost.vrednost)
        divVrednost.style.overflowX = 'auto'

        const btnPovezi = CrtanjeHTMLElemenata.nacrtajElement(li, 'label', ['btn', 'btn-primary', 'btnPovezi'], 'Povezi', `connect${vrednost.id}`)
        btnPovezi.addEventListener('click', () => {
            prikazZavisnosti(idParametra, vrednost)
            if (!parametar.pitanje) {
                document.getElementById('panelKriterijumiTacnosti').style.display = 'block'
                // document.getElementById('builder').style.display = 'block'
                const prethodnoUpozorenje = document.getElementById('upozorenje-filter')
                const prikazKt = prikazKriterijumaTacnosti(idParametra, vrednost.id, idSablona)
                zapamtiKtBtn.style.display = prikazKt ? 'block' : 'none'
                if (prikazKt == false && prethodnoUpozorenje == null) {
                    // const builder = document.getElementById('builder')
                    builder.innerHTML = ''
                    const divUpozorenje = CrtanjeHTMLElemenata.nacrtajElement(builder, 'div', [], '', 'upozorenje-filter')
                    divUpozorenje.style.display = 'flex'
                    divUpozorenje.style.fontStyle = 'italic'
                    CrtanjeHTMLElemenata.nacrtajElement(divUpozorenje, 'i', ['fa', 'fa-warning'])
                    const upozorenje = 'Da biste konfigurisali kada je odgovor tacan, potrebno je postaviti parametre pitanja.'
                    CrtanjeHTMLElemenata.nacrtajElement(divUpozorenje, 'div', upozorenje)
                }
                if (prikazKt && prethodnoUpozorenje != null) {
                    prethodnoUpozorenje.remove()
                }
            } else {
                // document.getElementById('builder').style.display = 'none'
                document.getElementById('panelKriterijumiTacnosti').style.display = 'none'
            }
        })
    }
    const natpis = 'Promeni defaultnu alternativu...'
    const li = CrtanjeHTMLElemenata.nacrtajElement(contextMenu, 'li', ['menu-item', 'liDugme'], natpis)
    li.addEventListener('click', () => {
        const selektovanaDefaultna = document.querySelector('input[name=defaultAlternativa]:checked')
        const idNoveDefaultne = Number(selektovanaDefaultna.value)
        promeniDefaultnu(idParametra, idNoveDefaultne)  
    })
}

function promeniDefaultnu (idParametra, idNoveDefaultne) {
    // pronalazimo prethodnu defaultnu
    const parametar = podaci.parametriPitanja.find(param => param.id == idParametra)
    const indeksParametra = podaci.parametriPitanja.indexOf(parametar)
    const prethodnaDefaultna = parametar.vrednosti.find(vrednost => vrednost.default === true)
    const indeksPrethodneDefaultne = podaci.parametriPitanja[indeksParametra].vrednosti.indexOf(prethodnaDefaultna)
    // pronalazimo koja je izabrana
    // const selektovanaDefaultna = document.querySelector('input[name=defaultAlternativa]:checked')
    const novaDefaultna = podaci.parametriPitanja[indeksParametra].vrednosti.find(vred => vred.id == idNoveDefaultne)
    const indeksNoveDefaultne = podaci.parametriPitanja[indeksParametra].vrednosti.indexOf(novaDefaultna)
    // postavljamo default u podaci
    podaci.parametriPitanja[indeksParametra].vrednosti[indeksPrethodneDefaultne].default = false
    podaci.parametriPitanja[indeksParametra].vrednosti[indeksNoveDefaultne].default = true
    // u sablonu pitanja i sablonima odgovora menjamo prethodnu defaultnu sa novom
    const prethodniTekst = `<em contenteditable="false" class="em${idParametra}">${prethodnaDefaultna.vrednost}</em>`
    const noviTekst = `<em contenteditable="false" class="em${idParametra}">${novaDefaultna.vrednost}</em>`
    const sablonPitanja = document.getElementById('parametri')
    sablonPitanja.innerHTML = sablonPitanja.innerHTML.replaceAll(prethodniTekst, noviTekst)
    
    const sabloniOdgovora = document.getElementsByClassName('sablonOdgovora')
    for (const sablonOdgovora of sabloniOdgovora) {
        sablonOdgovora.innerHTML = sablonOdgovora.innerHTML.replaceAll(prethodniTekst, noviTekst)
    }

    const pomocnaStruktura = kreirajPomocnuStrukturu()

    // ako nova defaultna ima zavisnosti, da proverim da li su zadovoljene (da li je bar jedna zadovoljena posto je ili)
    // if (!ispunjeneZavisnostiAlternative(novaDefaultna, pomocnaStruktura) && novaDefaultna.zavisnosti.length > 0) {
    if (!ispunjeneZavisnostiAlternative(novaDefaultna, pomocnaStruktura)) {    
        // postavljam da prva zavisnost bude ispunjena
        return promeniDefaultnu(novaDefaultna.zavisnosti[0].idParametra, novaDefaultna.zavisnosti[0].idVrednosti)
    }
    
}

function kreirajPomocnuStrukturu () {
    const pomocnaStruktura = podaci.parametriPitanja
    for (const parametar of pomocnaStruktura) {
        for (const vrednost of parametar.vrednosti) {
            for (const zavisnost of vrednost.zavisnosti) {
                const p = pomocnaStruktura.find(param => param.id == zavisnost.idParametra)
                const v = p.vrednosti.find(vred => vred.id == zavisnost.idVrednosti)
                const zavParVred = v.zavisnosti.find(zav => zav.idParametra == parametar.id && zav.idVrednosti == vrednost.id)
                if (!zavParVred) {
                    const azuriranjeParametar = pomocnaStruktura.indexOf(p)
                    const azuriranjeVrednost = pomocnaStruktura[azuriranjeParametar].vrednosti.indexOf(v)
                    pomocnaStruktura[azuriranjeParametar].vrednosti[azuriranjeVrednost].zavisnosti.push({
                        idParametra: parametar.id,
                        idVrednosti: vrednost.id
                    })
                }
            }
        }
    }
    return pomocnaStruktura
}

// function promeniDefaultnu (idParametra, idNoveDefaultne, obradjeniParametri) {
//     // pronalazimo prethodnu defaultnu
//     const parametar = podaci.parametriPitanja.find(param => param.id == idParametra)
//     const indeksParametra = podaci.parametriPitanja.indexOf(parametar)
//     const prethodnaDefaultna = parametar.vrednosti.find(vrednost => vrednost.default === true)
//     const indeksPrethodneDefaultne = podaci.parametriPitanja[indeksParametra].vrednosti.indexOf(prethodnaDefaultna)
//     // pronalazimo koja je izabrana
//     // const selektovanaDefaultna = document.querySelector('input[name=defaultAlternativa]:checked')
//     const novaDefaultna = podaci.parametriPitanja[indeksParametra].vrednosti.find(vred => vred.id == idNoveDefaultne)
//     const indeksNoveDefaultne = podaci.parametriPitanja[indeksParametra].vrednosti.indexOf(novaDefaultna)
//     // postavljamo default u podaci
//     podaci.parametriPitanja[indeksParametra].vrednosti[indeksPrethodneDefaultne].default = false
//     podaci.parametriPitanja[indeksParametra].vrednosti[indeksNoveDefaultne].default = true
//     // u sablonu pitanja i sablonima odgovora menjamo prethodnu defaultnu sa novom
//     const prethodniTekst = `<em class="em${idParametra}">${prethodnaDefaultna.vrednost}</em>`
//     const noviTekst = `<em class="em${idParametra}">${novaDefaultna.vrednost}</em>`
//     const sablonPitanja = document.getElementById('parametri')
//     sablonPitanja.innerHTML = sablonPitanja.innerHTML.replaceAll(prethodniTekst, noviTekst)
    
//     const sabloniOdgovora = document.getElementsByClassName('sablonOdgovora')
//     for (const sablonOdgovora of sabloniOdgovora) {
//         sablonOdgovora.innerHTML = sablonOdgovora.innerHTML.replaceAll(prethodniTekst, noviTekst)
//     }

//     // ako nova defaultna ima zavisnosti, da proverim da li su zadovoljene (da li je bar jedna zadovoljena posto je ili)
//     if (!ispunjeneZavisnostiAlternative(novaDefaultna) && novaDefaultna.zavisnosti.length > 0) {
//         // postavljam da prva zavisnost bude ispunjena
//         obradjeniParametri.push(novaDefaultna.zavisnosti[0].idParametra)
//         return promeniDefaultnu(novaDefaultna.zavisnosti[0].idParametra, novaDefaultna.zavisnosti[0].idVrednosti, obradjeniParametri)
//     }
//     // // za svaki ostali parametar proveravam da li postoji vrednost koja zavisi od nove defaultne i tu vrednost stavljam za defaultnu takodje
//     for (const parametar of podaci.parametriPitanja) {
//         if (parametar.id != idParametra) {
//         // if (!obradjeniParametri.includes(parametar.id)) {
//             let zavisiOdDefaultne = null
//             for (const vrednost of parametar.vrednosti) {
//                 const ima = vrednost.zavisnosti.find(zav => zav.idParametra == idParametra && zav.idVrednosti == idNoveDefaultne)
//                 if (ima) {
//                     // zavisiOdDefaultne = ima
//                     zavisiOdDefaultne = vrednost.id
//                 }
//             }
//             if (zavisiOdDefaultne) {
//                 obradjeniParametri.push(parametar.id)
//                 return promeniDefaultnu(parametar.id, zavisiOdDefaultne, obradjeniParametri)
//                 // return promeniDefaultnu(parametar.id, zavisiOdDefaultne.idVrednosti, obradjeniParametri)
//             }
//         }
//     }
/*
    // prolazim kroz sve ostale defaultne vrednosti za svaki parametar i proveravam da li su njihove zavisnosti ispunjene
    // for (const parametar of podaci.parametriPitanja) {
    //     if (parametar.id != idParametra) {
    //         const defaultna = parametar.vrednosti.find(vred => vred.default === true)
    //         // let ispunjeneZavisnosti = false
    //         // for (const zavisnost of defaultna.zavisnosti) {
    //         //     const parametar = podaci.parametriPitanja.find(param => param.id == zavisnost.idParametra)
    //         //     const vrednost = parametar.vrednosti.find(vred => vred.id == zavisnost.idVrednosti)
    //         //     if (vrednost.default) {
    //         //         ispunjeneZavisnosti = true
    //         //     }
    //         // }
    //         if (!ispunjeneZavisnostiAlternative(defaultna) && defaultna.zavisnosti.length > 0) {
    //             // postavljam da prva zavisnost bude ispunjena
    //             return promeniDefaultnu(defaultna.zavisnosti[0].idParametra, defaultna.zavisnosti[0].idVrednosti)
    //         }
    //     }
    // }
    */
// }

function ispunjeneZavisnostiAlternative (alternativa, pomocnaStruktura) {
    if (alternativa.zavisnosti.length === 0) {
        return true
    }
    let ispunjeneZavisnosti = false
    for (const zavisnost of alternativa.zavisnosti) {
        const parametar = pomocnaStruktura.find(param => param.id == zavisnost.idParametra)
        const parametarIndex = pomocnaStruktura.indexOf(parametar)
        const vrednost = pomocnaStruktura[parametarIndex].vrednosti.find(vred => vred.id == zavisnost.idVrednosti)
        if (vrednost.default) {
            ispunjeneZavisnosti = true
        }
    }
    return ispunjeneZavisnosti
}

let podaciKriterijumTacnosti = { 
    idParametra: -1,
    idVrednosti: -1,
    idSablona: -1
}
function prikazKriterijumaTacnosti(idParametra, idVrednosti, idSablona) {
    panelKriterijumiTacnosti.style.display = 'block'
    let sablonOdgovoraText = document.getElementById(`sablonOdgovora${idSablona}`).innerHTML
    sablonOdgovoraText = konvertujSablonOdgovora(sablonOdgovoraText, idParametra, idVrednosti)
    document.getElementById('tacanPitanje').innerHTML = sablonOdgovoraText

    const options = popuniOpcije()
    if (options.filters.length == 0) {
        return false
    }

    $('#builder').queryBuilder('destroy')
	$('#builder').queryBuilder(options)
    podaciKriterijumTacnosti = {
        idParametra,
        idVrednosti,
        idSablona
    }

    const kriterijumi = podaci.kriterijumiTacnosti
        .filter(el => el.idSablonaOdgovora == idSablona && el.idParametra == idParametra && el.idVrednosti == idVrednosti)
    if (kriterijumi.length > 0) {
        const uslov = kriterijumi[0].uslov
        if (Object.keys(uslov).length == 0) {
            optionUvekTacan.checked = true
        } else {
            optionPodUslovom.checked = true
            $('#builder').queryBuilder('setRules', uslov)
        }
    } else {
        optionNikadTacan.checked = true
    }
    builder.style.display = optionPodUslovom.checked ? 'block' : 'none'
    return true
}

const zapamtiKtBtn = document.getElementById('parse-json')
zapamtiKtBtn.addEventListener('click', zapamtiKriterijumTacnosti)
function zapamtiKriterijumTacnosti() {
    // ako vec postoji da se azurira, ako ne postoji da se dodaje
    let ktIndex = -1
    for (let i = 0; i < podaci.kriterijumiTacnosti.length; i++) {
        const kt = podaci.kriterijumiTacnosti[i]
        if (kt.idParametra == podaciKriterijumTacnosti.idParametra && kt.idVrednosti == podaciKriterijumTacnosti.idVrednosti && kt.idSablonaOdgovora == podaciKriterijumTacnosti.idSablona) {
            ktIndex = i
        }
    }
    if (optionNikadTacan.checked) {
        if (ktIndex > -1) { // ako postoji brisem ga
            podaci.kriterijumiTacnosti.splice(ktIndex, 1)
        }
        alert('Sacuvano')
        return
    }
    // ako je pod uslovom u kt upisujem uslov
    // ako je uvek tacan za uslov u kt upisujem {}
    // ako je nikad nije tacan ne upisujem nista u kt (nemam kt)
    const query = optionPodUslovom.checked 
        ? $('#builder').queryBuilder('getRules')
        : {}
    // query da pamtim u podatke, a njega da transformisem u parsedQuery u generator.js
    // const parsedQuery = parseQuery(query)
    if (ktIndex > -1) {
        if (optionPodUslovom.checked && query.rules.length == 0) { // brisanje
            alert('Niste ispravno uneli uslove!')
            return
        } else { // azuriranje
            podaci.kriterijumiTacnosti[ktIndex] = {
                uslov: query,
                idParametra: podaciKriterijumTacnosti.idParametra,
                idVrednosti: podaciKriterijumTacnosti.idVrednosti,
                idSablonaOdgovora: podaciKriterijumTacnosti.idSablona
            }
        }
    } else {
        podaci.kriterijumiTacnosti.push({
            uslov: query,
            idParametra: podaciKriterijumTacnosti.idParametra,
            idVrednosti: podaciKriterijumTacnosti.idVrednosti,
            idSablonaOdgovora: podaciKriterijumTacnosti.idSablona
        })
    }
    alert('Sacuvano')
}

function konvertujSablonOdgovora(sablonText, idParametra, idVrednosti) {
    const parametar = podaci.parametriPitanja.find(param => param.id == idParametra)
    const defaultVrednost = parametar.vrednosti.find(vrednost => vrednost.default == true).vrednost
    const vrednostParametra = parametar.vrednosti.find(vrednost => vrednost.id == idVrednosti).vrednost
    sablonText = sablonText.replaceAll(`<em contenteditable="false" class="em${idParametra}">${defaultVrednost}</em>`, `<em contenteditable="false" class="em${idParametra}">${vrednostParametra}</em>`)
    // mislim da nije dobro sredjeno kada sablon odgovora sadrzi parametre pitanja 

    return sablonText
}

function popuniOpcije() {
    const options = {
        allow_empty: true,
        filters: []
    }
    for(let i = 0; i < podaci.parametriPitanja.length; i++) {
        if (podaci.parametriPitanja[i].pitanje) {
            let label = '', values = []
            for (let j = 0; j < podaci.parametriPitanja[i].vrednosti.length; j++) {
                const vrednost = podaci.parametriPitanja[i].vrednosti[j].vrednost
                label += vrednost + ';'
                values.push(vrednost)
            }
            options.filters.push({
                id: podaci.parametriPitanja[i].id.toString(),
                label,
                type: 'string',
                values,
                input: 'select',
                operators: 'equal'
            })
        }
    }
    return options
}

const optionPodUslovom = document.getElementById('podUslovom')
const optionUvekTacan = document.getElementById('uvekTacan')
const optionNikadTacan = document.getElementById('nikadTacan')
optionPodUslovom.addEventListener('change', handleChangePodUslovom)
optionUvekTacan.addEventListener('change', handleChangePodUslovom)
optionNikadTacan.addEventListener('change', handleChangePodUslovom)
function handleChangePodUslovom () {
    builder.style.display = optionPodUslovom.checked ? 'block' : 'none'
}

const otvorena = document.getElementById('otvorena')
const zatvorena = document.getElementById('zatvorena')
const divBrojPonudjenih = document.getElementById('divBrojPonudjenih')
otvorena.addEventListener('change', handleChange)
zatvorena.addEventListener('change', handleChange)
function handleChange() {
    divBrojPonudjenih.style.display = zatvorena.checked ? 'block' : 'none'
}

function getIndexFromSelection (offset, previousSibling, parentElement) {
    // ako imam neki em ispred treba da povecam indeks za 21 za svaki <em>, za <i> dodajem 7
    let index = offset
    let prevElementStart = previousSibling
    while (prevElementStart != null) {
        if (prevElementStart.localName == 'em') {
            // index += prevElementStart.innerHTML.length + 21
            index += prevElementStart.innerHTML.length + 45
        } else {
            if (prevElementStart.localName == 'i') {
                // index += prevElementStart.innerHTML.length + 7
                index += prevElementStart.innerHTML.length + 31
            } else { // tekst je
                index += prevElementStart.textContent.length
            }
        }
        prevElementStart = prevElementStart.previousSibling
    }
    // indeks da povecam ako se radi o nekom drugom redu, ne prvom
    if (parentElement.id == '' && parentElement.className == '') { // znaci da nije u prvom redu sablona
        let parentSibling = parentElement.previousElementSibling
        while (parentSibling != null && parentSibling.id == '' && parentSibling.className == '') {
            index += parentSibling.outerHTML.length
            parentSibling = parentSibling.previousElementSibling
        }
        index += parentElement.parentElement.innerHTML.indexOf('<div>') + 5
    }

    return index
}

document.getElementById('sacuvajModelPitanja').addEventListener('click', sacuvajModelPitanja)
async function sacuvajModelPitanja () {
    const fileHandle = await window.showSaveFilePicker()
    const fileStream = await fileHandle.createWritable()
    zapamtiSablone()
    await fileStream.write(new Blob([JSON.stringify(podaci)], {type: "application/json;charset=utf-8"}))
    await fileStream.close()
}

document.getElementById('ucitajModelPitanja').addEventListener('click', ucitajModelPitanja)
async function ucitajModelPitanja () {
    ucitavanjeModela = true
    const pickerOpts = {
        // types: [
        //   {
        //     accept: {
        //       '/*': ['.txt']
        //     }
        //   },
        // ],
        // excludeAcceptAllOption: true,
        multiple: false
    }
    const [fileHandle] = await window.showOpenFilePicker(pickerOpts)
    const file = await fileHandle.getFile()
    const content = await file.text()
    const data = JSON.parse(content)
    podaci.sablonPitanja = data.sablonPitanja
    podaci.parametriPitanja = data.parametriPitanja
    podaci.sabloniOdgovora = data.sabloniOdgovora
    podaci.kriterijumiTacnosti = data.kriterijumiTacnosti
    if (podaci.parametriPitanja.length > 0) {
        redniBrojParametra = podaci.parametriPitanja[podaci.parametriPitanja.length - 1].id + 1
    }
    if (podaci.sabloniOdgovora.length > 0) {
        idSablonaOdgovora = podaci.sabloniOdgovora[podaci.sabloniOdgovora.length - 1].id + 1
    }
    popuniSablone()
}

function popuniSablone() {
    panelAlternative.style.display = 'none'
    panelDodavanjeZavisnosti.style.display = 'none'
    panelKriterijumiTacnosti.style.display = 'none'
    sablon.innerHTML = konvertujSablon(podaci.sablonPitanja)
    // let sablonText = sablon.innerHTML.replace(/&nbsp;/g, ' ').replace(/<div>/g, '\r\n').replace(/<\/div>/g, '')
    // podaci.sablonPitanja = kreirajSablon(sablonText)
    // const sabloniOdgovora = document.getElementsByClassName('sablonOdgovora')
    // for (const sablonOdgovora of sabloniOdgovora) {
    //     let sablonOdgovoraText = sablonOdgovora.innerHTML.replace(/&nbsp;/g, ' ').replace(/<div>/g, '\r\n').replace(/<\/div>/g, '')
    //     sablonOdgovoraText = kreirajSablon(sablonOdgovoraText)
    //     podaci.sabloniOdgovora.push({
    //         id: Number(sablonOdgovora.id.slice(14)),
    //         sablon: sablonOdgovoraText
    //     })
    // }
    // da se proveri
    // const sabloniOdgovora = document.getElementsByClassName('sablonOdgovora')
    // for (let i = 0; i < sabloniOdgovora.length; i++) {
    //     // let sablonOdgovoraText = sablonOdgovora.innerHTML.replace(/&nbsp;/g, ' ').replace(/<div>/g, '\r\n').replace(/<\/div>/g, '')
    //     sabloniOdgovora[i].innerHTML = konvertujSablon(podaci.sabloniOdgovora[i])
    //     // podaci.sabloniOdgovora.push({
    //     //     id: Number(sablonOdgovora.id.slice(14)),
    //     //     sablon: sablonOdgovoraText
    //     // })
    // }
    for (let i = 0; i < podaci.sabloniOdgovora.length; i++) {
        const sablon = konvertujSablon(podaci.sabloniOdgovora[i].sablon)
        const id = podaci.sabloniOdgovora[i].id
        dodajSablonOdgovora(id, sablon)
    }
}

function konvertujSablon (sablonTekst) {
    // let sablonText = sablon.innerHTML.replace(/&nbsp;/g, ' ').replace(/<div>/g, '\r\n').replace(/<\/div>/g, '')
    const vrednostiZaZamenu = []
    let posStart = sablonTekst.indexOf('<p')
    let posEnd = sablonTekst.indexOf('>', posStart)
    while (posStart > -1) {
        const vrednost = sablonTekst.substring(posStart, posEnd + 1)
        vrednostiZaZamenu.push(vrednost)
        posStart = sablonTekst.indexOf('<p', posEnd + 1)
        posEnd = sablonTekst.indexOf('>', posStart)
    }
    for (let i = 0; i < vrednostiZaZamenu.length; i++) {
        const indeks = Number(vrednostiZaZamenu[i].slice(2, -1))
        const defaultna = podaci.parametriPitanja.find(param => param.id == indeks).vrednosti.find(vred => vred.default == true).vrednost
        sablonTekst = sablonTekst.replace(vrednostiZaZamenu[i], `<em contenteditable="false" class="em${indeks}">${defaultna}</em>`)
    }
    return sablonTekst
}

const helperSablonPitanja = document.getElementById('helperSablonPitanja')
document.getElementById('otvoriHelperSablonPitanja').addEventListener('click', function () {
    helperSablonPitanja.style.display = 'flex'
})
document.getElementById('zatvoriHelperSablonPitanja').addEventListener('click', function () {
    helperSablonPitanja.style.display = 'none'
})

const helperSablonOdgovora = document.getElementById('helperSablonOdgovora')
document.getElementById('otvoriHelperSablonOdgovora').addEventListener('click', function () {
    helperSablonOdgovora.style.display = 'flex'
})
document.getElementById('zatvoriHelperSablonOdgovora').addEventListener('click', function () {
    helperSablonOdgovora.style.display = 'none'
})

document.getElementById('btnObrisiModel').addEventListener('click', function () {
    window.location.reload()
})

sablon.addEventListener("paste", (e) => {
e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand("insertHTML", false, text);
});

const divZadatak = document.getElementById('div-zadatak')
const btnPosalji = document.getElementById('posaljiOdgovor')

btnPosalji.addEventListener('click', async function () {
    zapamtiSablone()

    const time = Math.round(TimeMe.getTimeOnCurrentPageInSeconds())
    const akcijeKorisnika = korisnik.akcije.filter(akcija => (akcija.stranica === stranica) && akcija.pokusaj)
    akcijeKorisnika.sort((a, b) => b.pokusaj - a.pokusaj)
    const pokusaj = akcijeKorisnika.length > 0 ? akcijeKorisnika[0].pokusaj + 1 : 1
    await posaljiOdgovor({
        zadatakId: id,
        username: username,    
        odgovor: podaci,
        pokusaj
    })

    korisnik = await azurirajKorisnika(korisnik, {
        stranica,
        vreme: time, 
        pokusaj
    })
    // TimeMe.stopTimer()
    TimeMe.resetRecordedPageTime(stranica);
    // TimeMe.startTimer()

    alert(`${id ? 'Odgovor' : 'Model pitanja'} je uspesno poslat.`)
    if (id === 1) {
        showDialog2()
    }
    document.getElementById('podsetikZaSlanje').style.display = 'none'
})

const uradiKviz = document.getElementById('uradiKviz')
// let podsetnik = true
async function otvaranjeZadatka() {
    // if (podsetnik) {
        closeConfirmBox()
        showConfirmBox()
        uradiKviz.style.display = 'block'
    // }
}

let username, id, stranica, korisnik
window.addEventListener('load', async function () {
    const urlSearchParams = window.location.search
    const params = new URLSearchParams(urlSearchParams)
    id = Number(params.get('id'))
    btnPosalji.style.display = id ? 'block' : 'none'
    if (id) {
        divZadatak.style.display = 'block'
        divZadatak.innerHTML = zadaci[id-1]
        uradiKviz.style.display = 'block'
    } else {
        divZadatak.style.display = 'none'
        setTimeout(otvaranjeZadatka, timeout)
    }
    try {
        korisnik = await izdvojUsername()
    } catch(error) {
        document.getElementById('serverStop').style.display = 'block'
    }

    username = korisnik.username
    document.getElementById('pozdrav').innerHTML = username
    stranica = `zadatak-${id || 0}`

    TimeMe.initialize({
        currentPageName: stranica, // page name
        idleTimeoutInSeconds: 10 // stop recording time due to inactivity
    });
})

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
document.getElementById('btnPodseti').addEventListener('click',  () => {
    alertKviz()
    closeConfirmBox()
    setTimeout(otvaranjeZadatka, timeout)
})
document.getElementById('btnNe').addEventListener('click', () => {
    alertKviz()
    closeConfirmBox()
})

document.getElementById('btnClose').addEventListener('click', () => {
    closeConfirmBox()
    closeDialog2()
})

function showDialog2() {
    document.getElementById("overlay2").hidden = false;
}
function closeDialog2() {
    document.getElementById("overlay2").hidden = true;
}
document.getElementById('btnYes').addEventListener('click', () => otvoriZadatak(2))
document.getElementById('btnNo').addEventListener('click', closeDialog2)

if (id) {
    document.getElementById('tekstZadatak').style.display = 'block'
}

// TimeMe.initialize({
//     currentPageName: stranica, // page name
//     idleTimeoutInSeconds: 10 // stop recording time due to inactivity
// });

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

// const primerModelaPitanja = document.getElementById('primerModelaPitanja')
// document.getElementById('otvoriPrimerModelaPitanja').addEventListener('click', function () {
//     primerModelaPitanja.style.display = 'flex'
// })
// document.getElementById('zatvoriPrimerModelaPitanja').addEventListener('click', function () {
//     primerModelaPitanja.style.display = 'none'
// })

// brisanje parametra - ako ucestuvuje u kt ne bi trebalo da moze da se obrise
// takodje i brisanje vrednosti - uradjeno
// brisanje sablona odgovora - ok
// nakon brisanja parametra, ne radi Povezi - ok
// Missing filters - ok
// ok - kod kloniranja da postavim uslove: u sablonu odg samo jedan param odgovora (parametri odgovora da ne mogu da se kloniraju)
// ok - u odg parametar pitanja - ne radi
// onk - ako korisnik oznaci slova, da ne moze opseg brojeva da postavi
// ok - jedan parametar odgovora u jednom sablonu odgovora - ogranicenje
// prikazivanje kada je odgovor tacan, ako imam parametre pitanja - treba se razmisli
// deo za evaluaciju bolje da oznacim, sada su italic i veca slova
// ok - sredjivanje defaultne alternative
// ok - Zapamti kod postavljanja alternativa, vise puta se prikazuje Sacuvano
// ok - sredjivanje koda sa interfejsom (ubacivanje fja iz basic)
// ok - brisanje kloniranog parametra (ako imam dva ista u redu brise se uvek prvi, a treba koji je izabran)
// ok - sredjivanje interfejsa - bootstrap
// ok - boje za opcije selekta
// ok - ako je izabrano zatvorenog tipa, a nije unet broj ponudjenih odgovora, onda sve moguce ponudjene da prikazem
// ok - Ako se sacuva prazan kriterijum tacnosti - odgovor je uvek tacan!! - za uvek tacan uslov u kt je {}
// (da ima opcija uvek tacan da se izabere - tad da se upise {} u uslov, a kad se unese neispravan kt da se uopste ne upisuje u podaci)
// isprobavanje realnih primera
// primeri iz sir1
// ok - 1.
// ok - 2. (nije moguce kloniranje parametra odgovora) 
// bug - promeni defaultnu - ne radi savrseno, bitno da ne baca greske
// 3.
// 4.
