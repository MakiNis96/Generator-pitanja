// // primer formata - pitanje geografija:
// export const podaci = {
//     sablonPitanja: 'Koja je <p0> <p1> u <p2> ?',
//     parametriPitanja: [
//         {
//             id: 0,
//             pitanje: true, // ako se koristi u sablonu pitanja
//             opseg: false,
//             od: 0,
//             do: 0,
//             korak: 0,
//             vrednosti: [
//                 {
//                     id: 0,
//                     vrednost: 'najveca',
//                     zavisnosti: [
//                         {
//                             idParametra: 1,
//                             idVrednosti: 0 
//                         }
//                     ]
//                 },
//                 {
//                     id: 1,
//                     vrednost: 'najduza',
//                     zavisnosti: [
//                         {
//                             idParametra: 1,
//                             idVrednosti: 1 
//                         }
//                     ]
//                 },
//                 {
//                     id: 2,
//                     vrednost: 'najvisa',
//                     zavisnosti: [
//                         {
//                             idParametra: 1,
//                             idVrednosti: 2 
//                         }
//                     ]
//                 }
//             ]
//         },
//         {
//             id: 1,
//             pitanje: true,
//             opseg: false,
//             od: 0,
//             do: 0,
//             korak: 0,
//             vrednosti: [
//                 {
//                     id: 0,
//                     vrednost: 'drzava',
//                     zavisnosti: []
//                 },
//                 {
//                     id: 1,
//                     vrednost: 'reka',
//                     zavisnosti: []
//                 },
//                 {
//                     id: 2,
//                     vrednost: 'planina',
//                     zavisnosti: []
//                 }
//             ]
//         },
//         {
//             id: 2,
//             pitanje: true,
//             opseg: false,
//             od: 0,
//             do: 0,
//             korak: 0,
//             vrednosti: [
//                 {
//                     id: 0,
//                     vrednost: 'Evropi',
//                     zavisnosti: []
//                 },
//                 {
//                     id: 1,
//                     vrednost: 'Aziji',
//                     zavisnosti: []
//                 },
//                 {
//                     id: 2,
//                     vrednost: 'Africi',
//                     zavisnosti: []
//                 }
//             ]
//         },
//         {
//             id: 3,
//             pitanje: false,
//             opseg: false,
//             od: 0,
//             do: 0,
//             korak: 0,
//             vrednosti: [
//                 {
//                     id: 0,
//                     vrednost: 'Ukrajina',
//                     zavisnosti: [
//                         {
//                             idParametra: 1,
//                             idVrednosti: 0 
//                         }
//                     ]
//                 },
//                 {
//                     id: 1,
//                     vrednost: 'Rusija',
//                     zavisnosti: [
//                         {
//                             idParametra: 1,
//                             idVrednosti: 0
//                         }
//                     ]
//                 },
//                 {
//                     id: 2,
//                     vrednost: 'Alzir',
//                     zavisnosti: [
//                         {
//                             idParametra: 1,
//                             idVrednosti: 0 
//                         }
//                     ]
//                 },
//                 {
//                     id: 3,
//                     vrednost: 'Volga',
//                     zavisnosti: [
//                         {
//                             idParametra: 1,
//                             idVrednosti: 1 
//                         }
//                     ]
//                 },
//                 {
//                     id: 4,
//                     vrednost: 'Ob',
//                     zavisnosti: [
//                         {
//                             idParametra: 1,
//                             idVrednosti: 1 
//                         }
//                     ]
//                 },
//                 {
//                     id: 5,
//                     vrednost: 'Nil',
//                     zavisnosti: [
//                         {
//                             idParametra: 1,
//                             idVrednosti: 1 
//                         }
//                     ]
//                 },
//                 {
//                     id: 6,
//                     vrednost: 'Elbrus',
//                     zavisnosti: [
//                         {
//                             idParametra: 1,
//                             idVrednosti: 2
//                         }
//                     ]
//                 },
//                 {
//                     id: 7,
//                     vrednost: 'Himalaji',
//                     zavisnosti: [
//                         {
//                             idParametra: 1,
//                             idVrednosti: 2 
//                         }
//                     ]
//                 },
//                 {
//                     id: 8,
//                     vrednost: 'Kilimandzaro',
//                     zavisnosti: [
//                         {
//                             idParametra: 1,
//                             idVrednosti: 2 
//                         }
//                     ]
//                 },
//             ]
//         }
//     ],
//     sabloniOdgovora: [
//         {
//             id: 0,
//             sablon: '<p3> .'
//         }
//     ],
//     kriterijumiTacnosti: [
//         {
//             id: 0,
//             uslov: '1:0 && 2:0',
//             idParametra: 3,
//             idVrednosti: 0,
//             idSablonaOdgovora: 0
//         },
//         {
//             id: 1,
//             uslov: '1:0 && 2:1',
//             idParametra: 3,
//             idVrednosti: 1,
//             idSablonaOdgovora: 0
//         },
//         {
//             id: 2,
//             uslov: '1:0 && 2:2',
//             idParametra: 3,
//             idVrednosti: 2,
//             idSablonaOdgovora: 0
//         },
//         {
//             id: 3,
//             uslov: '1:1 && 2:0',
//             idParametra: 3,
//             idVrednosti: 3,
//             idSablonaOdgovora: 0
//         },
//         {
//             id: 4,
//             uslov: '1:1 && 2:1',
//             idParametra: 3,
//             idVrednosti: 4,
//             idSablonaOdgovora: 0
//         },
//         {
//             id: 5,
//             uslov: '1:1 && 2:2',
//             idParametra: 3,
//             idVrednosti: 5,
//             idSablonaOdgovora: 0
//         },
//         {
//             id: 6,
//             uslov: '1:2 && 2:0',
//             idParametra: 3,
//             idVrednosti: 6,
//             idSablonaOdgovora: 0
//         },
//         {
//             id: 7,
//             uslov: '1:2 && 2:1',
//             idParametra: 3,
//             idVrednosti: 7,
//             idSablonaOdgovora: 0
//         },
//         {
//             id: 8,
//             uslov: '1:2 && 2:2',
//             idParametra: 3,
//             idVrednosti: 8,
//             idSablonaOdgovora: 0
//         },
//     ]
// }

// primer - celoborjne promenljive
// export const podaci = {
//     sablonPitanja: 'Koliki je <p0> brojeva <p1> i <p2> ?',
//     parametriPitanja: [
//         {
//             pitanje: true, // ako se koristi u sablonu pitanja
//             opseg: false,
//             od: 0,
//             do: 0,
//             korak: 0,
//             vrednosti: [
//                 {
//                     vrednost: 'zbir',
//                     zavisnosti: [
//                     ]
//                 },
//                 {
//                     vrednost: 'razlika',
//                     zavisnosti: [
//                     ]
//                 },
//                 {
//                     vrednost: 'proizvod',
//                     zavisnosti: [
//                     ]
//                 }
//             ]
//         },
//         {
//             pitanje: true,
//             opseg: true,
//             od: 5,
//             do: 9,
//             korak: 2,
//             vrednosti: [
//                 {
//                     vrednost: '5',
//                     zavisnosti: []
//                 },
//                 {
//                     vrednost: '7',
//                     zavisnosti: []
//                 }
//             ]
//         },
//         {
//             pitanje: true,
//             opseg: true,
//             od: 1,
//             do: 4,
//             korak: 1,
//             vrednosti: [
//                 {
//                     vrednost: '1',
//                     zavisnosti: []
//                 },
//                 {
//                     vrednost: '2',
//                     zavisnosti: []
//                 },
//                 {
//                     vrednost: '3',
//                     zavisnosti: []
//                 }
//             ]
//         },
//         {
//             pitanje: false,
//             opseg: false,
//             od: 0,
//             do: 0,
//             korak: 0,
//             vrednosti: [
//                 {
//                     vrednost: '+',
//                     zavisnosti: [
//                     ]
//                 },
//                 {
//                     vrednost: '-',
//                     zavisnosti: [
//                     ]
//                 },
//                 {
//                     vrednost: '*',
//                     zavisnosti: [
//                     ]
//                 }
//             ]
//         }
//     ],
//     sabloniOdgovora: [
//         '<p1> <p3> <p2>'
//     ],
//     kriterijumiTacnosti: [
//         {
//             uslov: '0:0',
//             idParametra: 3,
//             idVrednosti: 0,
//             idSablonaOdgovora: 0
//         },
//         {
//             uslov: '0:1',
//             idParametra: 3,
//             idVrednosti: 1,
//             idSablonaOdgovora: 0
//         },
//         {
//             uslov: '0:2',
//             idParametra: 3,
//             idVrednosti: 2,
//             idSablonaOdgovora: 0
//         }
//     ]
// }

// primer - dva sablona odg
// export const podaci = {
//     sablonPitanja: 'Cemu sluzi operator <p0> ?',
//     parametriPitanja: [
//         {
//             pitanje: true, // ako se koristi u sablonu pitanja
//             opseg: false,
//             od: 0,
//             do: 0,
//             korak: 0,
//             vrednosti: [
//                 {
//                     vrednost: '+',
//                     zavisnosti: [
//                     ]
//                 },
//                 {
//                     vrednost: '-',
//                     zavisnosti: [
//                     ]
//                 },
//                 {
//                     vrednost: '++',
//                     zavisnosti: [
//                     ]
//                 },
//                 {
//                     vrednost: '--',
//                     zavisnosti: [
//                     ]
//                 }
//             ]
//         },
//         {
//             pitanje: false,
//             opseg: false,
//             od: 0,
//             do: 0,
//             korak: 0,
//             vrednosti: [
//                 {
//                     vrednost: 'umanjenje',
//                     zavisnosti: []
//                 },
//                 {
//                     vrednost: 'uvecanje',
//                     zavisnosti: []
//                 }
//             ]
//         }
//     ],
//     sabloniOdgovora: [
//         'Oznacava <p1> promenljive za 1.',
//         'Oznacava <p1> promenljive za specificnu vrednost.'
//     ],
//     kriterijumiTacnosti: [
//         {
//             uslov: '0:3',
//             idParametra: 1,
//             idVrednosti: 0,
//             idSablonaOdgovora: 0
//         },
//         {
//             uslov: '0:2',
//             idParametra: 1,
//             idVrednosti: 1,
//             idSablonaOdgovora: 0
//         },
//         {
//             uslov: '0:1',
//             idParametra: 1,
//             idVrednosti: 0,
//             idSablonaOdgovora: 1
//         },
//         {
//             uslov: '0:0',
//             idParametra: 1,
//             idVrednosti: 1,
//             idSablonaOdgovora: 1
//         }
//     ]
// }

// type ModelPitanja = {
//     sablonPitanja: string,
//     parametri: Parametar[],
//     sabloniOdgovora: string[],
//     kriterijumiTacnosti: KriterijumTacnosti[]
// }

// type Zavisnost = {
//     idParametra: number,
//     idVrednosti: number
// }
// type Vrednost = {
//     vrednost: string,
//     zavisnosti: Zavisnost[]
// }

// type Parametar = {
//     pitanje: boolean,
//     opseg: boolean,
//     od: number,
//     do: number,
//     korak: number,
//     vrednosti: Vrednost[]
// }

// type KriterijumTacnosti = {
//     uslov: string,
//     idParametra: number,
//     idVrednosti: number,
//     idSablonaOdgovora: number
// }

// ovo je zakomentarisano zbog testiranja
export const podaci = {
    sablonPitanja: '',
    parametriPitanja: [
       
    ],
    sabloniOdgovora: [

    ],
    kriterijumiTacnosti: [
        
    ]
}
