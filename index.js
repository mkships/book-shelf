// Get references to the search-form, search results and shelf count //
const searchInput = document.getElementById("searchInput")
const searchStatus = document.getElementById("searchStatus")
const shelfCount = document.getElementById("shelfCount")
const searchForm = document.getElementById("searchForm")
const searchResults = document.getElementById("searchResults")
const readlist = document.getElementById("readlist")

// Add event listeners and corresponding handler functions //
searchForm.addEventListener("submit", handleSearchSubmit)
searchResults.addEventListener("click", handleResultsClick)
readlist.addEventListener("click", handleReadlistClick)

async function handleSearchSubmit(event) {
  event.preventDefault()
  const term = searchInput.value.trim()
  if (!term) return

  searchStatus.textContent = "Searching…"
  try {
    const books = await searchBooks(term)
    searchStatus.textContent = books.length ? "" : "No books found."
    renderResults(books)
  } catch (error) {
    searchStatus.textContent = "Something went wrong. Please try again."
  }
}

function handleResultsClick(event) {
  const button = event.target.closest('button[data-action="add"]')
  if (!button) return
  const card = button.closest(".book-card")
  const workId = card.dataset.id
  // TODO: addBook(workId)
}

function handleReadlistClick(event) {
  const button = event.target.closest('button[data-action="remove"]')
  if (!button) return
  const card = button.closest(".book-card")
  const workId = card.dataset.id
  // TODO: removeBook(workId)
}

// Add functions to retrieve results from Open Library API and normalise the raw json //
async function searchBooks(term) {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(term)}&fields=key,title,author_name,first_publish_year,cover_i&limit=20`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Search failed: ${response.status}`)
  const data = await response.json()
  return data.docs.map(toBook)
}

function toBook(doc) {
  return {
    id: doc.key,
    title: doc.title,
    author: doc.author_name?.[0] ?? "Unknown author",
    year: doc.first_publish_year ?? "Unknown",
    coverUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null,
  }
}

// Add function to build the book card //
function buildBookCard(book) {
  const article = document.createElement("article")
  article.className = "book-card"
  article.dataset.id = book.id

  const cover = document.createElement("img")
  cover.className = "book-card__cover"
  cover.src = book.coverUrl ?? ""
  cover.alt = `Cover of ${book.title}`

  const body = document.createElement("div")
  body.className = "book-card__body"

  const title = document.createElement("h3")
  title.className = "book-card__title"
  title.textContent = book.title

  const author = document.createElement("p")
  author.className = "book-card__author"
  author.textContent = book.author

  const meta = document.createElement("p")
  meta.className = "book-card__meta"
  meta.textContent = `First published ${book.year}`

  const actions = document.createElement("div")
  actions.className = "book-card__actions"

  const addButton = document.createElement("button")
  addButton.type = "button"
  addButton.className = "btn btn-primary"
  addButton.dataset.action = "add"
  addButton.textContent = "Want to read"

  actions.appendChild(addButton)
  body.append(title, author, meta, actions)
  article.append(cover, body)

  return article
}

// Add function to render the search results //
function renderResults(books) {
  searchResults.innerHTML = ""

  if (!books.length) {
    const empty = document.createElement("div")
    empty.className = "empty"
    empty.textContent = "No books found — try a different search."
    searchResults.appendChild(empty)
    return
  }

  const cards = books.map(buildBookCard)
  searchResults.append(...cards)
}

