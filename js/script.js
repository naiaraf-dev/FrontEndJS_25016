document.addEventListener("DOMContentLoaded", () => {
  // Inicialización del carrito
  let cart = JSON.parse(localStorage.getItem("cart")) || []
  updateCartCount()

  // funcionalidad del carrito
  const addToCartButtons = document.querySelectorAll(".add-to-cart")
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const id = this.getAttribute("data-id")
      const name = this.getAttribute("data-name")
      const price = Number.parseFloat(this.getAttribute("data-price"))

      // if(item existe)
      const existingItem = cart.find((item) => item.id === id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        cart.push({
          id,
          name,
          price,
          quantity: 1,
        })
      }

      // guardar carrito en el localStorage
      localStorage.setItem("cart", JSON.stringify(cart))

      // actualizar contador
      updateCartCount()

      // item agregado
      showToast(`${name} agregado al carrito!`)

      const cartIcon = document.querySelector("#open-cart i")
      cartIcon.classList.add("cart-bounce")
      setTimeout(() => {
        cartIcon.classList.remove("cart-bounce")
      }, 500)
    })
  })

  // función actualizar contador
  function updateCartCount() {
    const cartCount = document.getElementById("cart-count")
    const count = cart.reduce((total, item) => total + item.quantity, 0)
    cartCount.textContent = count
  }

  // mostrar notificación toast
  function showToast(message) {
    // crear elemento toast
    const toast = document.createElement("div")
    toast.className = "toast-notification"
    toast.textContent = message
    document.body.appendChild(toast)

    // styles
    toast.style.position = "fixed"
    toast.style.bottom = "20px"
    toast.style.right = "20px"
    toast.style.backgroundColor = "var(--primary-color)"
    toast.style.color = "white"
    toast.style.padding = "10px 20px"
    toast.style.borderRadius = "5px"
    toast.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)"
    toast.style.zIndex = "1000"
    toast.style.opacity = "0"
    toast.style.transition = "opacity 0.3s ease"

    // mostrar y esconder toast
    setTimeout(() => {
      toast.style.opacity = "1"
    }, 10)

    setTimeout(() => {
      toast.style.opacity = "0"
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 3000)
  }

  // Sliding cart
  const slidingCart = document.getElementById("sliding-cart")
  const cartOverlay = document.getElementById("cart-overlay")
  const openCartBtn = document.getElementById("open-cart")
  const closeCartBtn = document.getElementById("close-cart")
  const continueShoppingBtn = document.getElementById("continue-shopping")

  function openCart() {
    slidingCart.classList.add("open")
    cartOverlay.classList.add("open")
    document.body.style.overflow = "hidden" // Prevent scrolling
    renderCartItems()
  }

  function closeCart() {
    slidingCart.classList.remove("open")
    cartOverlay.classList.remove("open")
    document.body.style.overflow = "" // Allow scrolling again
  }

  openCartBtn.addEventListener("click", (e) => {
    e.preventDefault()
    openCart()
  })

  closeCartBtn.addEventListener("click", closeCart)
  continueShoppingBtn.addEventListener("click", closeCart)
  cartOverlay.addEventListener("click", closeCart)

  // items del carrito
  function renderCartItems() {
    const cartItemsContainer = document.getElementById("cart-items")
    const cartTotal = document.getElementById("cart-total")

    // vaciar container
    cartItemsContainer.innerHTML = ""

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío</p>'
      cartTotal.textContent = "$0.00"
      return
    }

    // calcular total
    let total = 0

    // agregar cada item
    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity
      total += itemTotal

      const cartItem = document.createElement("div")
      cartItem.className = "cart-item"
      cartItem.innerHTML = `
        <div class="cart-item-details">
          <h6>${item.name}</h6>
          <p>$${item.price.toFixed(2)} each</p>
        </div>
        <div class="cart-item-quantity">
          <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
        </div>
        <div class="cart-item-total">
          $${itemTotal.toFixed(2)}
        </div>
        <button class="btn btn-sm btn-danger ms-2 remove-item" data-id="${item.id}">
          <i class="bi bi-trash"></i>
        </button>
      `

      cartItemsContainer.appendChild(cartItem)
    })

    // actualizar total
    cartTotal.textContent = `$${total.toFixed(2)}`

    // AddEventListeners para los botones
    const decreaseButtons = document.querySelectorAll(".decrease-quantity")
    const increaseButtons = document.querySelectorAll(".increase-quantity")
    const removeButtons = document.querySelectorAll(".remove-item")

    decreaseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        updateItemQuantity(id, -1)
      })
    })

    increaseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        updateItemQuantity(id, 1)
      })
    })

    removeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        removeItem(id)
      })
    })
  }

  // Update item quantity
  function updateItemQuantity(id, change) {
    const item = cart.find((item) => item.id === id)

    if (item) {
      item.quantity += change

      if (item.quantity <= 0) {
        // remover item si la cantidad es 0 o menos
        cart = cart.filter((item) => item.id !== id)
      }

      // guardar carrito en localStorage
      localStorage.setItem("cart", JSON.stringify(cart))

      updateCartCount()
      renderCartItems()
    }
  }

  // remover item del carrito
  function removeItem(id) {
    cart = cart.filter((item) => item.id !== id)

    // guardar carrito en localStorage
    localStorage.setItem("cart", JSON.stringify(cart))

    updateCartCount()
    renderCartItems()
  }

  // Checkout
  const checkoutBtn = document.getElementById("checkout-btn")
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("Your cart is empty!")
      return
    }

    // esconder sliding cart
    closeCart()

    // modal checkout 
    const checkoutModal = new bootstrap.Modal(document.getElementById("checkoutModal"))
    checkoutModal.show()

    // Render checkout items
    renderCheckoutItems()
  })

  // Render checkout items
  function renderCheckoutItems() {
    const checkoutItemsContainer = document.getElementById("checkout-items")
    const checkoutTotal = document.getElementById("checkout-total")

    // vaciar container
    checkoutItemsContainer.innerHTML = ""

    // Calcular total
    let total = 0

    // agregar cada item
    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity
      total += itemTotal

      const checkoutItem = document.createElement("div")
      checkoutItem.className = "d-flex justify-content-between"
      checkoutItem.innerHTML = `
        <div>${item.name} x ${item.quantity}</div>
        <div>$${itemTotal.toFixed(2)}</div>
      `

      checkoutItemsContainer.appendChild(checkoutItem)
    })

    // actualizar total
    checkoutTotal.textContent = `$${total.toFixed(2)}`
  }

  // checkout form
  const checkoutForm = document.getElementById("checkout-form")
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // simular orden
    const orderId = "ORD-" + Math.floor(Math.random() * 1000000)
    document.getElementById("order-id").textContent = orderId

    const checkoutModal = bootstrap.Modal.getInstance(document.getElementById("checkoutModal"))
    checkoutModal.hide()

    const confirmationModal = new bootstrap.Modal(document.getElementById("confirmationModal"))
    confirmationModal.show()

    cart = []
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()
  })

  const contactForm = document.getElementById("contactForm")
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()


      contactForm.reset()

      showToast("Message sent successfully!")
    })
  }

  // Smooth scrolling para los anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      if (this.getAttribute("href") !== "#") {
        e.preventDefault()

        const targetId = this.getAttribute("href")
        const targetElement = document.querySelector(targetId)

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 70,
            behavior: "smooth",
          })
        }
      }
    })
  })

  // declarar las variables de bootstrap
  const bootstrap = window.bootstrap
})
