import { Permutiranje } from "./permutiranje.js"
import { podaci } from './podaci.js'

const inputRezultat = document.getElementById('rezultat')

export function generisiPitanja() {
    console.log(podaci)
    // ISPRAVKA - da moze prvo parametri odgovora pa onda parametri pitanja da se oznacavaju (sada mora prvo parametri pitanja pa odgovora)
    const data = podaci.parametriPitanja.filter(parametar => parametar.pitanje === true)
                                        // .map(parametar => parametar.vrednosti)
    const permutiranje = new Permutiranje()
    if (data.length == 0) {
        alert('Niste oznacili tekst za variranje')
        return
    }
    const izlaz = permutiranje.permutiraj(data)
    console.log(izlaz) // niz nizova, jedan element je objekat koji sadrzi objekat vrednost i idParametra

    for (const komb of izlaz) {
        let mogucaKombinacija = true // true
        let stvarniParametriZaParsiranje = []
        for (const param of komb) {
            let mk = false
            if (param.vrednost.zavisnosti.length > 0) {
                for (const zavisnost of param.vrednost.zavisnosti) {
                    // let redniBrojNezavisnog = zavisnost.idParametra
                    // const redniBrojVrednosti = zavisnost.idVrednosti
                    // const vrednostZaPoredjenje = podaci.parametriPitanja[redniBrojNezavisnog].vrednosti[redniBrojVrednosti].vrednost
                    // if (vrednostZaPoredjenje == komb[redniBrojNezavisnog].vrednost) { // !=
                    //     mk = true
                    // }
                    const idParametra = zavisnost.idParametra
                    const idVrednosti = zavisnost.idVrednosti
                    const vrednostZaPoredjenje = podaci.parametriPitanja.find(param => param.id == idParametra)
                                                .vrednosti.find(vrednost => vrednost.id == idVrednosti).vrednost
                    if (vrednostZaPoredjenje == komb.find(k => k.idParametra == idParametra).vrednost.vrednost) { // !=
                        mk = true
                    }
                }
                if (mk) {
                    stvarniParametriZaParsiranje.push({
                        idParametra: param.idParametra,
                        vrednost: param.vrednost
                    })
                }
            } else {
                mk = true
                stvarniParametriZaParsiranje.push({
                    idParametra: param.idParametra,
                    vrednost: param.vrednost
                })
            }
            mogucaKombinacija = mogucaKombinacija && mk
        }
        if (mogucaKombinacija) {
            console.log(stvarniParametriZaParsiranje)
            parsiranje(stvarniParametriZaParsiranje)
            generisanjeOdgovora(stvarniParametriZaParsiranje)
        }
    }
}

// listParametara - niz objekata koji sadrze idParametra i objekat vrednost
function parsiranje (listaParametara) {
    // let sablon = podaci.sablonPitanja
    let sablon = podaci.sablonPitanja.replace(/<div>/g, '\r\n').replace(/<\/div>/g, '')
    // ISPRAVKA - da ne moraju prvo parametri pitanja da se unose
    // let indeksUListiParametara = 0
    // for (let i = 0; i < podaci.parametriPitanja.length; i++) {
    //     if (podaci.parametriPitanja[i].pitanje) {
    //         sablon = sablon.replace(`<p${i}>`, listaParametara[indeksUListiParametara])
    //         indeksUListiParametara++
    //     }
    // }

    for (const parametar of podaci.parametriPitanja) {
        if (parametar.pitanje) {
            const vrednostZaUmetanje = listaParametara.find(param => param.idParametra == parametar.id).vrednost.vrednost
            sablon = sablon.replaceAll(`<p${parametar.id}>`, vrednostZaUmetanje)
        }
    }
    // fali obrada specijalnih karaktera za gift
    // inputRezultat.value += sablon
    // inputRezultat.value += '\r\n'
    inputRezultat.innerHTML += sablon
    inputRezultat.innerHTML += '<br/>'
}

function obradaSpecijalnihKarakteraZaGift(rec) {
    if (rec.indexOf('{') > -1)
        rec = rec.replace('{', '\\{')
    if (rec.indexOf('}') > -1)
        rec = rec.replace('}', '\\}')
    if (rec.indexOf('#') > -1)
        rec = rec.replace('#', '\\#')
    if (rec.indexOf('~') > -1)
        rec = rec.replace('~', '\\~')
    if (rec.indexOf(':') > -1)
        rec = rec.replace(':', '\\:')
    if (rec.indexOf('=') > -1)
        rec = rec.replace('=', '\\=')
    return rec
}

function generisanjeOdgovora(listaParametara) {
    // const sabloni = podaci.sabloniOdgovora
    const ponudjeniOdgovori = [] // niz stringova
    // u zavisnosti od toga sta imam u listaParametara treba da vidim koje ponudjene odgovore da prikazem
    for (const sablon of podaci.sabloniOdgovora) {
        const sabl = sablon.sablon.replace(/<div>/g, '\r\n').replace(/<\/div>/g, '')
        let sadrziParametarOdgovora = false
        for (const parametar of podaci.parametriPitanja) {
            if (sabl.indexOf(`<p${parametar.id}>`) > -1 && parametar.pitanje == false) {
                sadrziParametarOdgovora = true
                for (const vrednost of parametar.vrednosti) {
                    //prvo proverim zavisnosti dal se uklapaju a onda ako se uklapaju stampam svaku vrednost umesto <oN>
                    const listaZavisnosti = vrednost.zavisnosti //ako listaZavisnosti nema elemenata, treba sve da se uzme, od niceg ne zavisi
                    
                    const vrednosti = [] // niz ciji je jedan element vrednost: string i idVrednosti: number
                    if (listaZavisnosti.length > 0) {
                        let poklapanje = true // logicko AND
                        for (const zav of listaZavisnosti) {
                            const idParametra = zav.idParametra
                            const idVrednosti = zav.idVrednosti
                            const vrednostZaPoredjenje = podaci.parametriPitanja.find(param => param.id == idParametra).vrednosti.find(vred => vred.id == idVrednosti).vrednost
                            if (listaParametara.find(param => param.idParametra == idParametra).vrednost.vrednost != vrednostZaPoredjenje) {
                                poklapanje = false
                            }

                        }
                        if (poklapanje) {
                            vrednosti.push({
                                vrednost: vrednost.vrednost,
                                idVrednosti: vrednost.id
                            })
                        }
                    } else {
                        vrednosti.push({
                            vrednost: vrednost.vrednost,
                            idVrednosti: vrednost.id
                        })
                    }
                    let transformisanSablon = sabl
                    // parametri pitanja koji se javljaju u odgovoru
                    for (const paramPitanja of podaci.parametriPitanja) {
                        if (paramPitanja.pitanje) {
                            const vrednostZaUmetanje = listaParametara.find(param => param.idParametra == paramPitanja.id).vrednost.vrednost
                            transformisanSablon = transformisanSablon.replaceAll(`<p${paramPitanja.id}>`, vrednostZaUmetanje)
                        }
                    }
                    for (const vrednost of vrednosti) {
                        transformisanSablon = transformisanSablon.replaceAll(`<p${parametar.id}>`, vrednost.vrednost)
                        // s je redni broj sablona
                        // i je redni broj parametra
                        // v je id vrednosti
                        if (proveraTacanOdgovor(listaParametara, parametar.id, vrednost.idVrednosti, sablon.id)) {
                            ponudjeniOdgovori.push("=" + obradaSpecijalnihKarakteraZaGift(transformisanSablon))
                        }
                        else {
                            ponudjeniOdgovori.push("~" + obradaSpecijalnihKarakteraZaGift(transformisanSablon))
                        }
                    }
                }
            }
        }
        if (sadrziParametarOdgovora == false) // to su distraktori, ne mogu nikad da budu tacni
        {
            ponudjeniOdgovori.push("~" + obradaSpecijalnihKarakteraZaGift(sabl))
        }
    }

    const transformisaniPonudjeniOdgovori = [] // List<string>
    for(const ponudjenOdgovor of ponudjeniOdgovori) {
        let transformisanOdgovor = ponudjenOdgovor
        for (const parametar of podaci.parametriPitanja) {
            if (parametar.pitanje) {
                const vrednostZaUmetanje = listaParametara.find(param => param.idParametra == parametar.id).vrednost.vrednost
                transformisanOdgovor = transformisanOdgovor.replaceAll(`<p${parametar.id}>`, vrednostZaUmetanje)
            }
        }
        // for(let p = 0; p < podaci.parametriPitanja.length; p++) { // ovo mislim da ne treba sada
        //     transformisanOdgovor = transformisanOdgovor.replace(`<p${p.toString()}>`, listaParametara[p])
        // }
        // ISPRAVKA - da su delovi sablona odgovora koji treba da se evaluiraju stavljeni izmedju <i> </i>
        let transformisanOdgovorNakonEvaluacije = transformisanOdgovor.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        while(transformisanOdgovorNakonEvaluacije.indexOf('<i contenteditable\\="false" style="color\\:red">') > -1) {
            const pocetakDelaEvaluacije = transformisanOdgovorNakonEvaluacije.indexOf('<i contenteditable\\="false" style="color\\:red">')
            const krajDelaEvaluacije = transformisanOdgovorNakonEvaluacije.indexOf('</i>')
            const deoZaZamenu = transformisanOdgovorNakonEvaluacije.substring(pocetakDelaEvaluacije, krajDelaEvaluacije + 4)
            const zamena = transformisanOdgovorNakonEvaluacije.substring(pocetakDelaEvaluacije + 28 + 19, krajDelaEvaluacije)
            // const zamena = transformisanOdgovorNakonEvaluacije.substring(pocetakDelaEvaluacije + 28, krajDelaEvaluacije)
            // const zamena = transformisanOdgovorNakonEvaluacije.substring(pocetakDelaEvaluacije + 3, krajDelaEvaluacije)
            let zamenaEvaluacija
            try {
                zamenaEvaluacija = eval(zamena)
            } catch (e) {
                zamenaEvaluacija = zamena
            }
            transformisanOdgovorNakonEvaluacije = transformisanOdgovorNakonEvaluacije.replace(deoZaZamenu, zamenaEvaluacija)
        }

        // ponudjeniOdgovori[j].substr(0, 1) - je '=' ili '~'
        transformisaniPonudjeniOdgovori.push(transformisanOdgovorNakonEvaluacije)
        // transformisaniPonudjeniOdgovori.push(ponudjeniOdgovori[j].substr(0, 1) + transformisanOdgovorNakonEvaluacije)
    }
    // inputRezultat.value += '{\r\n'
    inputRezultat.innerHTML += '{<br/>'
    const zatvorena = document.getElementById('zatvorena')
    if (zatvorena.checked) { //pitanja zatvorenog tipa - sa ponudjenim bar jednim tacnim odgovorom i vise distraktora
        let redniBrojTacnogOdgovora = -1
        for (let j = 0; j < transformisaniPonudjeniOdgovori.length; j++) {
            if (transformisaniPonudjeniOdgovori[j].substr(0, 1) == '=') {
                redniBrojTacnogOdgovora = j
            }
        }
        const brojPonudjenih = document.getElementById('brojPonudjenih').value
        let brojPonudjenihOdgovora = brojPonudjenih 
            ? Number(brojPonudjenih) - 1 // - 1 jer se uvek prikazuje tacan, a ostali se biraju random
            : transformisaniPonudjeniOdgovori.length
        const redniBrojeviPonudjenih = [] // List<int>
        redniBrojeviPonudjenih.push(redniBrojTacnogOdgovora)
        if (brojPonudjenihOdgovora < transformisaniPonudjeniOdgovori.length - 1) {
            while (brojPonudjenihOdgovora > 0) {
                let redniBrojPon = parseInt(Math.random() * transformisaniPonudjeniOdgovori.length - 1)
                if (!redniBrojeviPonudjenih.includes(redniBrojPon)) {
                    redniBrojeviPonudjenih.push(redniBrojPon)
                    brojPonudjenihOdgovora--
                }
            }

            for (let j = 0; j < transformisaniPonudjeniOdgovori.length; j++) {
                if (redniBrojeviPonudjenih.includes(j)) {
                    // inputRezultat.value += transformisaniPonudjeniOdgovori[j] + '\r\n'
                    inputRezultat.innerHTML += transformisaniPonudjeniOdgovori[j] + '<br/>'
                }
            }
        } else {
            for (let j = 0; j < transformisaniPonudjeniOdgovori.length; j++) {
                // inputRezultat.value += transformisaniPonudjeniOdgovori[j] + '\r\n'
                inputRezultat.innerHTML += transformisaniPonudjeniOdgovori[j] + '<br/>'
            }
        }
    }  else { // pitanja otvorenog tipa - bez ponudjenih odgovora, ispisujem samo tacne odgovore
        for(const odgovor of transformisaniPonudjeniOdgovori) {
            if (odgovor[0] == '=') {
                // inputRezultat.value += "=%100%" + odgovor.substring(1) + '\r\n'
                inputRezultat.innerHTML += "=%100%" + odgovor.substring(1) + '<br/>'
            }
        }
    }
    // inputRezultat.value += '}\r\n\r\n'
    // inputRezultat.value = inputRezultat.value.replaceAll('&gt;', '>').replaceAll('&lt;', '<')
    inputRezultat.innerHTML += '}<br/><br/>'
    inputRezultat.innerHTML = inputRezultat.innerHTML.replaceAll('&gt;', '>').replaceAll('&lt;', '<')
}

function proveraTacanOdgovor(listaParametara, idParametra, idVrednosti, idSablonaOdgovora) {
    let tacanOdg = false
    // pronalazim kriterijum tacnosti koji je vezan za taj sablon odgovora i za tu vrednost parametra
    const kt = podaci.kriterijumiTacnosti.find(el => el.idSablonaOdgovora == idSablonaOdgovora && el.idParametra == idParametra && el.idVrednosti == idVrednosti)
    if (kt == null) {
        return false
    }
    // kt.uslov je query objekat
    const uslov = parseQuery(kt.uslov)
    // const uslov = kt.uslov // uslov je u obliku ( 0:0 AND 1:1 ) OR ( 1:0 AND 0:2 ) - blanko znaci obavezni
    // prazna zavisnost <> - uvek tacan odgovor
    if (uslov != '') {
        const deloviUslova = uslov.split(' ')
        const deloviUslovaZaParser = [] // List<string>
        for (const deoUslova of deloviUslova) {
            if (deoUslova == '(' || deoUslova == ')' || deoUslova == '&&' || deoUslova == '||') {
                deloviUslovaZaParser.push(deoUslova)
            } else {
                const idParametra = parseInt(deoUslova.split(':')[0])
                const idVrednosti = parseInt(deoUslova.split(':')[1])
                const vrednostIzListe = listaParametara.find(param => param.idParametra == idParametra).vrednost.vrednost
                const parametar = podaci.parametriPitanja.find(param => param.id == idParametra)
                const vrednostZaPoredjenje = parametar.vrednosti.find(vrednost => vrednost.id == idVrednosti).vrednost
                deloviUslovaZaParser.push(vrednostIzListe == vrednostZaPoredjenje)
            }
        }
        const izrazZaParser = deloviUslovaZaParser.reduce((total, deoUslova) => total + deoUslova + ' ', '')
        if (eval(izrazZaParser)) {
            tacanOdg = true
        }
    } else {
        tacanOdg = true
    }
        
    return tacanOdg
}

export function parseQuery (query) {
    const lastOperator = []
    const rulesLengths = []
    let ruleLevel = 0
    let equationString = ''
    const stringQuery = checkDisplayLogic(query)
    return stringQuery
    function checkDisplayLogic(rulesData) {
        if (rulesData['rules'] !== undefined) {
            ruleLevel++
            const operator = rulesData['condition']
            lastOperator.push(operator)
            rulesLengths.push(rulesData.rules.length)
            equationString += '( '
            $.each(rulesData.rules, function (idx, elem) {
                checkDisplayLogic(elem)
                if (rulesLengths[rulesLengths.length - 1] == idx + 1) {
                    equationString += ' )'
                    rulesLengths.pop()
                    ruleLevel--
                    lastOperator.pop()
                }
                else {
                    if (lastOperator.length !== 0)
                        equationString += ' ' + (operator === 'AND' ? '&&' : '||' ) + ' '
                        // equationString += ' ' + operator + ' '
                }
            });
        }
        else {
            const inputType = rulesData.input
            if (inputType === 'select') {
                const idParam = rulesData.id
                const value = rulesData.value
                const parametar = podaci.parametriPitanja.find(param => param.id == idParam)
                const vrednost = parametar.vrednosti.find(vrednost => vrednost.vrednost == value)
                equationString += idParam + ':' + vrednost.id
            }
        }
        return equationString // && zamenima sa AND, || sa OR
    } 
}
