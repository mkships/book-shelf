// Get references to the search-form, search results and shelf count //
const searchInput = document.getElementById("searchInput")
const searchStatus = document.getElementById("searchStatus")
const shelfCount = document.getElementById("shelfCount")
const searchForm = document.getElementById("searchForm")
const searchResults = document.getElementById("searchResults")
const readlist = document.getElementById("readlist")
const tabs = document.querySelectorAll(".tab")

// State: books the user has saved to their shelf, persisted to localStorage.
// Each entry carries a `read` flag so a future toggle can flip read/unread
// without a second array //
const STORAGE_KEY = "bookshelf.readList"

function loadReadList() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    return []
  }
}

function saveReadList() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(readList))
}

let readList = loadReadList()

// Add event listeners and corresponding handler functions //
searchForm.addEventListener("submit", handleSearchSubmit)
searchResults.addEventListener("click", handleResultsClick)
readlist.addEventListener("click", handleReadlistClick)
tabs.forEach((tab) => tab.addEventListener("click", () => activateTab(tab)))

function activateTab(selectedTab) {
  tabs.forEach((tab) => {
    const isSelected = tab === selectedTab
    tab.setAttribute("aria-selected", String(isSelected))
    tab.tabIndex = isSelected ? 0 : -1
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !isSelected
  })
}

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
  addBook(card.book)
}

function handleReadlistClick(event) {
  const removeButton = event.target.closest('button[data-action="remove"]')
  if (removeButton) {
    const card = removeButton.closest(".book-card")
    removeBook(card.dataset.id)
    return
  }

  const readButton = event.target.closest('button[data-action="mark-read"]')
  if (readButton) {
    const card = readButton.closest(".book-card")
    markAsRead(card.dataset.id)
  }
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

// Add function to build a book card. `context` controls the card's buttons:
// "results" gets a single "Want to read" button, "shelf" gets a "Read it"
// button (once read, it disappears) plus a Remove button. //
function buildBookCard(book, context = "results") {
  const article = document.createElement("article")
  article.className = "book-card"
  if (context === "shelf" && book.read) {
    article.classList.add("book-card--read")
  }
  article.dataset.id = book.id
  article.book = book

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

  if (context === "results") {
    const addButton = document.createElement("button")
    addButton.type = "button"
    addButton.className = "btn btn-primary"
    addButton.dataset.action = "add"
    addButton.textContent = "Want to read 📖"
    actions.appendChild(addButton)
  } else {
    if (!book.read) {
      const readButton = document.createElement("button")
      readButton.type = "button"
      readButton.className = "btn btn-ghost"
      readButton.dataset.action = "mark-read"
      readButton.textContent = "Read it ☑️"
      actions.appendChild(readButton)
    }

    const removeButton = document.createElement("button")
    removeButton.type = "button"
    removeButton.className = "btn btn-ghost"
    removeButton.dataset.action = "remove"
    removeButton.textContent = "Remove ✖️"
    actions.appendChild(removeButton)
  }
  body.append(title, author, meta, actions)
  article.append(cover, body)

  return article
}

// Add functions to manage the shelf (readList) //
function addBook(book) {
  const alreadySaved = readList.some((saved) => saved.id === book.id)
  if (alreadySaved) return

  readList = [...readList, { ...book, read: false }]
  saveReadList()
  renderShelf()
  updateShelfCount()
}

function removeBook(workId) {
  readList = readList.filter((saved) => saved.id !== workId)
  saveReadList()
  renderShelf()
  updateShelfCount()
}

function markAsRead(workId) {
  readList = readList.map((saved) =>
    saved.id === workId ? { ...saved, read: true } : saved
  )
  saveReadList()
  renderShelf()
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

  const cards = books.map((book) => buildBookCard(book, "results"))
  searchResults.append(...cards)
}

// Add function to render the shelf //
function renderShelf() {
  readlist.innerHTML = ""

  if (!readList.length) {
    const empty = document.createElement("div")
    empty.className = "empty"
    empty.textContent = "Your shelf is empty — add books from the search results above."
    readlist.appendChild(empty)
    return
  }

  const cards = readList.map((book) => buildBookCard(book, "shelf"))
  readlist.append(...cards)
}

// Add function to update the shelf count //
function updateShelfCount() {
  shelfCount.textContent = readList.length
}

// Reflect any persisted shelf data on first load //
renderShelf()
updateShelfCount()

