class headerBar extends HTMLElement {
  constructor(){
    super();

    this.attachShadow({mode:"open"});
    this.menuOpen = false;
  }

  static get observedAttributes(){
    return [
      "logo", "logoAlt", "logoTitle", "link1", 
      "link2", "link2Text", 
      "link3", "link3Text", 
      "link4", "link4Text"];
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    if (attr === "logo") {
      this.logo = newVal;
    }
    if (attr === "logoAlt") {
      this.logoAlt = newVal;
    }
    if (attr === "logoTitle") {
      this.logoTitle = newVal;
    }
    if (attr === "link1") {
      this.link1 = newVal;
    }
    if (attr === "link2") {
      this.link2 = newVal;
    }
    if (attr === "link2Text") {
      this.link2Text = newVal;
    }
    if (attr === "link3") {
      this.link3 = newVal;
    }
    if (attr === "link3Text") {
      this.link3Text = newVal;
    }
    if (attr === "link4") {
      this.link4 = newVal;
    }
    if (attr === "link4Text") {
      this.link4Text = newVal;
    }
  }

  getTemplate(){ //*Esto será puro HTML
    const template = document.createElement('template');
    template.innerHTML = `
      <header class="header">
        <a href="${this.getAttribute("link1")}" class="iconography-link" >
          <div class="iconography">
            <div class="logo">
              <img src= "${this.logo}" alt="${this.getAttribute("logoAlt")}" title="${this.getAttribute("logoTitle")}"/>
            </div>
            <div class="name">
              Matices&nbsp;Narrativos
            </div>
          </div>
        </a>
        <button class="hamburger" aria-label="Menu" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav>
          <ul class="nav">
              <li><a href="${this.getAttribute("link2")}" title="${this.getAttribute("link2Text")}">${this.getAttribute("link2Text")}</a></li>
              <li><a href="${this.getAttribute("link3")}" title="${this.getAttribute("link3Text")}">${this.getAttribute("link3Text")}</a></li>
              <li><a href="${this.getAttribute("link4")}" title="${this.getAttribute("link4Text")}">${this.getAttribute("link4Text")}</a></li>
          </ul>
        </nav>
      </header>
      ${this.getStyles()} <!---Aplicamos los estilos--->
    `;
    return template;
  }


  getStyles() {
    return `
      <style>
      * {
        font-family: Roboto, Helvetica, sans-serif;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      /* All the color must be defined here */
      @media (prefers-color-scheme: dark) {
        header.header{
          background-color: var(--primary-background-color-dark);
          color: var(--primary-text-color-dark);
        }
        a{
          color: var(--primary-text-color-dark);
        }
      }
      @media (prefers-color-scheme: light) {
        header.header{
          background-color: var(--primary-background-color-light);
          color: var(--primary-text-color-light);
        }
        a{
          color: var(--primary-text-color-light);
        }
      }
      header.header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 1em 5%;
        min-height: 80px;
        max-height: var(--header-height);
        position: relative;
      }
      header.header .iconography {
        display: flex;
        align-items: center;
      }
      header.header .iconography-link{
        text-decoration: none;
      }
      header.header .iconography div:first-child {
        margin-right: 5%;
      }
      header.header .iconography .logo,
      header.header .iconography .name{
        height: 100%;
        width: auto;
        text-decoration: none;
      }
      header.header .iconography .name{
        color: var(--primary-green);
        font-size: 1.5rem;
        font-family: 'Roboto Slab', serif;
      }
      header.header .iconography .logo img{
        max-height: calc(var(--header-height) - 20px);
      }
      header.header nav{
        /* margin-right: 5%; */
      }
      header.header nav .nav {
        display: flex;
        list-style: none;
      }
      header.header nav .nav li a{
        font-size: 1rem;
        text-decoration: none;
        padding: 8px 19px;
      }
      header.header nav .nav li a:hover{
        background-color: var(--primary-green);
        border-radius: 30px;
        box-shadow: -5px 5px 3px var(--secondary-green);
        transition: all .2s linear;
      }
      .hamburger {
        display: none;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        background: none;
        border: none;
        cursor: pointer;
        z-index: 2;
        position: relative;
      }
      .hamburger span {
        display: block;
        width: 28px;
        height: 4px;
        margin: 4px 0;
        background: var(--primary-green);
        border-radius: 2px;
        transition: all 0.3s;
        position: relative;
      }
      /* Hamburger to X animation */
      .hamburger.open span:nth-child(1) {
        transform: rotate(45deg) translate(7px, 7px);
      }
      .hamburger.open span:nth-child(2) {
        opacity: 0;
      }
      .hamburger.open span:nth-child(3) {
        transform: rotate(-45deg) translate(10px, -10px);
      }
      @media (max-width: 768px) {
        header.header nav {
          position: absolute;
          top: -100%;
          right: 0;
          left: 0;
          background: inherit;
          z-index: 1;
          visibility: hidden;
        }
        header.header nav .nav {
          flex-direction: column;
          background: inherit;
          width: 100%;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        header.header nav.open {
          top: 100px;
          min-height: calc(100vh - 100px);
          overflow: visible;
          visibility: visible;
          border-bottom: 1px solid var(--primary-green);
          transform: translateX(0);
          transition: transform .3s;
        }
        header.header nav .nav li{
          padding: 15px 0;
          font-size: 2rem;
        }
        header.header nav .nav li a{
          font-size: 2rem;
        }
        .hamburger {
          display: flex;
        }
      }
      @media (max-width: 450px) {
        header.header .iconography .name{
          display: none;
        }
      }
      @media (min-width: 769px){
        header.header nav .nav {
          flex-direction: row;
        }
        header.header nav .nav li a{
          font-size: 1.5rem;
          text-decoration: none;
          padding: 8px 29px;
        }
      }
      </style>
    `;
  }

  render(){//hace que el contenido del template se pueda clonar para agregarlo al DOM
    //Ahora para poder renderizar nuestros templates tenemos que cambiar el contexto
    //Donde agregamos nuestro template ya que lo estabamos agregando al dom global
    //Ahora debemos agregarlo en nuestro shadow dom que es otro contexto diferente
    this.shadowRoot.appendChild(this.getTemplate().content.cloneNode(true));
    this.addHamburgerListener();
  }

  addHamburgerListener() {
  const hamburger = this.shadowRoot.querySelector('.hamburger');
  const navList = this.shadowRoot.querySelector('nav');
  let scrollY = 0; // store scroll position

  if (hamburger && navList) {
    const closeMenu = () => {
      navList.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };

    const openMenu = () => {
      scrollY = window.scrollY;
      navList.classList.add('open');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    };

    hamburger.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      if (isOpen) openMenu();
      else closeMenu();
    });

    // --- ✅ Auto-close on resize ---
    window.addEventListener('resize', () => {
      const desktopBreakpoint = 769; // adjust to your breakpoint
      if (window.innerWidth >= desktopBreakpoint && navList.classList.contains('open')) {
        closeMenu();
      }
    });
  }
}

  //*Esto es lo que agregará cosas al DOM
  connectedCallback(){
    this.render();
  }
}

customElements.define("my-header", headerBar)