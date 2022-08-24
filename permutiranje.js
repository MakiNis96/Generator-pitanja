
export class Permutiranje {
    permutiranje (res, ix, data, izlaz) {
        for (let v of data[ix].vrednosti) {
            res[ix] = {
                vrednost: v,
                idParametra: data[ix].id
            }
            if (ix >= data.length - 1) {
                izlaz.push([])
                for (let s of res) {
                    izlaz[izlaz.length - 1].push(s)
                }
            } else {
                this.permutiranje(res, ix + 1, data, izlaz)
            }
        }
    }
    permutiraj (data) {
        const izlaz = []
        this.permutiranje([], 0, data, izlaz)
        return izlaz
    }
        
}