export class CrtanjeHTMLElemenata { 
    static nacrtajElement (kontejner, tag, naziviKlasa = [], natpis = '', id) {
        const element = document.createElement(tag)
        element.innerHTML = natpis
        kontejner.appendChild(element)
        if (id) {
            element.id = id
        }
        for (const nazivKlase of naziviKlasa) {
            element.classList.add(nazivKlase)
        }
        return element
    }

    static nacrtajRadioInput (kontejner, name, id, value) {
        const element = this.nacrtajElement(kontejner, 'input')
        element.classList.add('data-hj-allow')
        element.type = 'radio'
        element.name = name
        if (id) {
            element.id = id
        }
        element.value = value
        return element
    }

    static nacrtajOption (kontejner, natpis, vrednost, klase = []) {
        const option = this.nacrtajElement(kontejner, 'option', klase, natpis)
        option.value = vrednost
        return option
    }

    static nacrtajInput (kontejner, vrednost, naziviKlasa, id, placeholder) {
        const element = this.nacrtajElement(kontejner, 'input', naziviKlasa, '', id)
        element.value = vrednost
        element.classList.add('form-control')
        element.classList.add('data-hj-allow')
        if (placeholder) {
            element.placeholder = placeholder
        }
        return element
    }

    static nacrtajContenteditableDiv (kontejner, id, naziviKlasa) {
        const div = this.nacrtajElement(kontejner, 'div', naziviKlasa, '', id)
        div.contentEditable = true
        return div
    }
}

