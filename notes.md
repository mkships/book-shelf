<!--
    SCAFFOLD NOTES
    --------------
    This is HTML + CSS only. The JavaScript is yours to write in index.js.

    Containers your JS will render into (hooks are wired below):
      #searchForm     — submit handler: read #searchInput, call searchBooks(), renderResults()
      #searchInput    — the catalog search field
      #searchResults  — renderResults() clears + fills this (the transient searchResults[])
      #searchStatus   — show "Searching…" / "No books found" / errors here
      #watchlist      — renderWatchlist() clears + fills this (your saved watchlist[])
      #shelfCount     — update the little count next to "My shelf"

    Each card below is a STATIC EXAMPLE showing what buildBookCard(book) should
    output. Your render functions will clear the container and inject cards like
    these. Note the data-* hooks for event delegation:
      article.book-card[data-id]      — the book's work key, e.g. "/works/OL27448W"
      button[data-action="add"]       — add this result to the watchlist
      button[data-action="remove"]    — remove this book from the watchlist

      <!-- Your logic goes here. Suggested functions:
       toBook(doc) · searchBooks(term) · addBook / removeBook / isSaved · render… -->

  -->
