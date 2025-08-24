const pokemonList = document.getElementById("pokemonList")
const loadMoreButton = document.getElementById("loadMoreButton")
const limit = 10;
let offset = 0;
const modal = document.getElementById('pokemonModal');
const closeModalBtn = document.getElementById("closeModal")
const modalBody = document.getElementById("modalBody")
const modalContent = document.querySelector('#pokemonModal .modal-content')

function loadPokemonItens(offset,limit){
    function convertPokemonToLi(pokemon){
        return `
            <li class="pokemon ${pokemon.type}">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>
                <div class="detail">
                    <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join("")}                    
                    </ol>
                    <img src="${pokemon.photo}" alt="${pokemon.name}">
                </div>
            </li>
        `
    }
    
    pokeApi.getPokemons(offset,limit).then((pokemons = []) => {
        const newHtml = pokemons.map(convertPokemonToLi).join("")
        pokemonList.innerHTML += newHtml
    })
}

loadPokemonItens(offset,limit)

loadMoreButton.addEventListener("click", () => {
    offset += limit
    loadPokemonItens(offset,limit)
})

pokemonList.addEventListener("click", (event) => {
    const li = event.target.closest("li.pokemon")
    if (!li) return
    const name = li.querySelector(".name")?.textContent?.trim()
    if (name) {
        showPokemonDetailsByName(name)
    }
})

function openModal() {
  modal.classList.add('is-open');
}

function closeModal() {
  modal.classList.remove('is-open');
}

closeModalBtn.addEventListener("click", closeModal)
window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal()
})
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal()
})

function showPokemonDetailsByName(name){
  fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`)
    .then((res) => res.json())
    .then((data) => {
      const typesArr = data.types.map(t => t.type.name)
      const firstType = typesArr[0] || 'electric'

      modalContent.classList.remove(
        ...Array.from(modalContent.classList).filter(c => c.startsWith('theme-'))
      )
      modalContent.classList.add(`theme-${firstType}`)

      const typeBadges = typesArr.map(t => `<span class="type-badge">${t}</span>`).join('')

      // barrinha stats
      const statMax = 255
      const statRows = data.stats.map(s => {
        const val = s.base_stat
        const pct = Math.min(100, Math.round((val / statMax) * 100))
        const name = s.stat.name.replace(/-/g, ' ')
        return `
          <div class="stat-row">
            <span class="stat-name">${name}</span>
            <div class="stat-bar"><div class="stat-fill" style="width:${pct}%"></div></div>
            <span class="stat-val">${val}</span>
          </div>
        `
      }).join('')

      const img =
        data.sprites?.other?.['official-artwork']?.front_default ||
        data.sprites?.other?.home?.front_default ||
        data.sprites?.front_default

        modalBody.innerHTML = `
        <h2>${data.name} (#${data.id})</h2>

        <div class="modal-hero">
            <img src="${img}" alt="${data.name}">
            <div>
            <div class="type-badges">${typeBadges}</div>
            <p><strong>Altura:</strong> ${(data.height / 10).toFixed(1)} m</p>
            <p><strong>Peso:</strong> ${(data.weight / 10).toFixed(1)} kg</p>
            <p><strong>Habilidades:</strong> ${data.abilities.map(a => a.ability.name).join(', ')}</p>
            </div>
        </div>

        <h3>Stats</h3>
        <div class="stats">
            ${statRows}
        </div>
        `
      openModal()

      requestAnimationFrame(() => {
        document.querySelectorAll('.stat-fill').forEach(el => {
          const w = el.style.width; el.style.width = '0%'; // reset
          requestAnimationFrame(() => el.style.width = w); 
        })
      })
    })
    .catch((err) => {
      console.error(err)
      modalBody.innerHTML = `<p>Não foi possível carregar os detalhes. Tente novamente.</p>`
      openModal()
    })
}

    // const listItens = []

    // for (let i = 0; i < pokemons.length; i++) {
    //     const pokemon = pokemons[i];
    //     listItens.push(convertPokemonToLi(pokemon))
    // }
