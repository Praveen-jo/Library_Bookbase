// array to store books objects
let myLibrary = [];

// Book class to create book objects
class Book {
  constructor(title, author, pages) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.isRead = false;
  }
  toggleRead() {
    this.isRead = !this.isRead;
  }
  info() {
    return `${this.title} by ${this.author}, ${this.pages} pages, ${this.isRead ? 'read' : 'not read yet'}`
  }
}

// function to add a book to the library array
function addBookToLibrary(title, author, pages) {
  const newBook = new Book(title, author, pages);
  myLibrary.push(newBook)
}

// function to remove a book from the library array
function removeBookFromLibrary(book) {
  myLibrary = myLibrary.filter(b => b.id !== book.id);
}

// function to get random unique consistent img from picsum
function getBookImageUrl(book, size = 200) {
  if (!book || !book.id) return `https://picsum.photos/${size}`;
  const seed = book.id.replace(/-/g, '').substring(0, 10);
  return `https://picsum.photos/seed/${seed}/${size}`;
}

// function to render book cards from mylibrary array
function renderBookCards() {
  const bookCardsContainer = document.querySelector('.book-cards-container');
  if (!bookCardsContainer) return;

  bookCardsContainer.innerHTML = '';

  if (myLibrary.length === 0) {
    bookCardsContainer.innerHTML = '<div class="empty-state">No books in your library. Add a book to get started!</div>';
    return;
  }

  myLibrary.forEach(book => {
    if (!book || !book.id || !book.title) return;
    const bookCard = document.createElement('div');
    bookCard.classList.add('book-card');
    bookCard.dataset.bookId = book.id;
    bookCard.innerHTML = `
      <div class="book-card-image">
        <img src="${getBookImageUrl(book)}" alt="${book.title}">
        ${book.isRead ? '<span class="book-read-badge">✓</span>' : ''}
      </div>
      <div class="book-card-title">${book.title}</div>
      <div class="book-card-author">${book.author}</div>
      <div class="book-card-actions">
        <button class="book-card-read-toggle">${book.isRead ? 'Mark as Unread' : 'Mark as Read'}</button>
        <button class="book-card-delete">Delete</button>
      </div>
    `;

    const readToggleBtn = bookCard.querySelector('.book-card-read-toggle');
    const deleteBtn = bookCard.querySelector('.book-card-delete');

    if (readToggleBtn) {
      readToggleBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (book && typeof book.toggleRead === 'function') {
          book.toggleRead();
          renderBookCards();
          renderBookDetails(book);
        }
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        removeBookFromLibrary(book);
        renderBookCards();
        if (myLibrary.length > 0) {
          renderBookDetails(myLibrary[0]);
        } else {
          renderBookDetails();
        }
      });
    }

    bookCard.addEventListener('click', function (event) {
      if (!event.target.closest('.book-card-actions')) {
        renderBookDetails(book);
      }
    });

    bookCardsContainer.appendChild(bookCard);
  });
}

// function to render book details in the details panel
function renderBookDetails(book) {
  const detailsPanel = document.querySelector('.details-panel');
  if (!detailsPanel) return;

  if (!book || !book.id) {
    detailsPanel.innerHTML = '<div class="empty-state">Select a book to view details</div>';
    return;
  }

  detailsPanel.innerHTML = `
    <div class="book-details-image">
      <img src="${getBookImageUrl(book)}" alt="${book.title}">
      ${book.isRead ? '<div class="book-read-badge">✓ Read</div>' : ''}
    </div>
    <div class="book-details-title">${book.title || 'Untitled'}</div>
    <div class="book-details-author">${book.author || 'Unknown Author'}</div>
    <div class="book-details-pages">${book.pages || 0} pages</div>
    <div class="book-details-actions">
      <button class="book-details-read-toggle">${book.isRead ? 'Mark as Unread' : 'Mark as Read'}</button>
    </div>
  `;

  const detailsToggleButton = detailsPanel.querySelector('.book-details-read-toggle');
  if (detailsToggleButton) {
    detailsToggleButton.addEventListener('click', function (event) {
      event.stopPropagation();
      if (book && typeof book.toggleRead === 'function') {
        book.toggleRead();
        renderBookCards();
        renderBookDetails(book);
      }
    });
  }
}

// function to show the add book modal
function showAddBookModal() {
  // Prevent multiple modals
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) return;

  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';

  // Create modal dialog
  const modalDialog = document.createElement('div');
  modalDialog.className = 'modal-dialog';

  // Modal close button
  const closeButton = document.createElement('button');
  closeButton.innerText = '×';
  closeButton.className = 'modal-close';

  const closeModal = () => {
    if (modalOverlay.parentNode) {
      document.body.removeChild(modalOverlay);
    }
  };

  closeButton.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function (event) {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });

  // Modal form
  const form = document.createElement('form');
  form.className = 'add-book-form';
  form.innerHTML = `
    <h2 style="margin-bottom:14px;">Add a New Book</h2>
    <label>
      Title:<br>
      <input type="text" name="title" required style="width:100%;margin-bottom:10px;">
    </label><br>
    <label>
      Author:<br>
      <input type="text" name="author" required style="width:100%;margin-bottom:10px;">
    </label><br>
    <label>
      Pages:<br>
      <input type="number" name="pages" min="1" required style="width:100%;margin-bottom:10px;">
    </label><br>
    <button type="submit" style="padding:8px 20px;">Add Book</button>
  `;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const title = form.title.value.trim();
    const author = form.author.value.trim();
    const pages = parseInt(form.pages.value, 10);

    if (title && author && !isNaN(pages) && pages > 0) {
      try {
        addBookToLibrary(title, author, pages);
        renderBookCards();
        if (myLibrary.length > 0) {
          renderBookDetails(myLibrary[myLibrary.length - 1]);
        }
        closeModal();
      } catch (error) {
        console.error('Error adding book:', error);
      }
    }
  });

  modalDialog.appendChild(closeButton);
  modalDialog.appendChild(form);
  modalOverlay.appendChild(modalDialog);
  document.body.appendChild(modalOverlay);
}

// function to handle the add book button click
const addBookButton = document.querySelector('.add-book-button');
if (addBookButton) {
  addBookButton.addEventListener('click', function (event) {
    event.preventDefault();
    showAddBookModal();
  });
}


// page loads, add 3 sample books to the library
addBookToLibrary('The Hobbit', 'J.R.R. Tolkien', 295);
addBookToLibrary('Game of Thrones', 'George R.R. Martin', 835);
addBookToLibrary('The Harry Potter and the Philosopher\'s Stone', 'J.K. Rowling', 223);

// render book cards
renderBookCards();

if (myLibrary.length > 0) {
  renderBookDetails(myLibrary[0]);
}