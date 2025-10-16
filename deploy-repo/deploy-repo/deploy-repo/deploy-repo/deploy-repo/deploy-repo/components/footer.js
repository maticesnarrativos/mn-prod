class footerBar extends HTMLElement {
  constructor(){
    super();

    this.attachShadow({mode:"open"});
  }

  static get observedAttributes(){
    return ["logo", "logoAlt", "logoTitle", "link1", "link1Text", "link2", "link2Text"];
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
    if (attr === "link1Text") {
      this.link1Text = newVal;
    }
    if (attr === "link2") {
      this.link2 = newVal;
    }
    if (attr === "link2Text") {
      this.link2Text = newVal;
    }
  }

  getTemplate(){ //*Esto será puro HTML
    const template = document.createElement('template');
     // Dynamically set the base path for assets
    const base =
      window.location.hostname === "maticesnarrativos.github.io"
        ? "/mn-dev/"
        : "/";
    template.innerHTML = `
      <link rel="stylesheet" href="${base}assets/css/font-awesome.min.css">
      <footer class="footer">
        <section class="columns">
          <div class="column">
            <div class="logo">
              <img src= "${this.logo}" alt="${this.getAttribute("logoAlt")}" title="${this.getAttribute("logoTitle")}"/>
            </div>
          </div>
          <div class="column">
            <h4>Informaci&oacute;n de Contacto</h4>
            <ul class="icon-list">
              <li class="icon-list-item">
                <a href="https://wa.me/50688566678" target="_blank" rel="noopener noreferrer">
                  <span class="icon-list-item-icon">
                    <i class="fa fa-whatsapp" aria-hidden="true"></i>
                  </span >
                  <span class="icon-list-item-text">
                    Tel&eacute;fono: +506 88566678
                  </span >
                </a>
              </li>
              <li class="icon-list-item">
                <a href="mailto:matices.narrativos@outlook.com">
                  <span class="icon-list-item-icon">
                    <i class="fa fa-envelope"></i>
                  </span >
                  <span class="icon-list-item-text">
                    Correo: matices.narrativos@outlook.com
                  </span >
                </a>
              </li>
            </ul>
          </div>
          <div class="column">
            <h4>T&eacute;rminos y Condiciones</h4>
            <ul class="text-list">
              <li><a href="${this.getAttribute("link1")}" title="${this.getAttribute("link1Text")}">${this.getAttribute("link1Text")}</a></li>
              <li><a href="${this.getAttribute("link2")}" title="${this.getAttribute("link2Text")}">${this.getAttribute("link2Text")}</a></li>
            </ul>
          </div>
          <div class="column social">
            <h4>S&iacute;guenos</h4>
            <ul class="icon-list">
              <li class="icon-list-item">
                <a href="https://www.facebook.com/share/18tjPKQjAF/" target="_blank" rel="noopener noreferrer">
                  <span class="icon-list-item-icon">
                    <i class="fa fa-facebook"></i>
                  </span >
                </a>
              </li>
              <li class="icon-list-item">
                <a href="https://www.instagram.com/matices.narrativos" target="_blank" rel="noopener noreferrer">
                  <span class="icon-list-item-icon">
                    <i class="fa fa-instagram"></i>
                  </span >
                </a>
              </li>
            </ul>
          </div>
        </section>
      </footer>
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
        footer.footer{
          background-color: var(--primary-background-color-dark);
          color: var(--primary-text-color-dark);
        }
        a{
          color: var(--primary-text-color-dark);
        }
      }
      @media (prefers-color-scheme: light) {
        footer.footer{
          background-color: var(--primary-background-color-light);
          color: var(--primary-text-color-light);
        }
        a{
          color: var(--primary-text-color-light);
        }
      }

      /* Start footer styles */
      footer.footer .columns{
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 1rem 0;
        align-items: center;
        overflow: hidden;
      }
      footer.footer .column{
        text-align: center;
        width: 90%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin: 0.5rem;
      }
      footer.footer .column .logo img{
        width: 75%;
        max-width: 150px;
      }
      footer.footer .column h4{
        margin: 1rem 0;
      }
      footer.footer .column .icon-list,
      footer.footer .column .text-list{
        list-style: none;
        margin: 0.5rem 0;
      }
      footer.footer .column .icon-list-item,
      footer.footer .column .text-list li{
        font-size: 1rem;
        line-height: 1.5rem;
        transition: all .2s ease-in-out;
      }
      footer.footer .column .icon-list-item:hover,
      footer.footer .column .text-list li:hover{
        transform: scale(1.15);
      }
      footer.footer .column .icon-list-item a,
      footer.footer .column .text-list a{
        text-decoration: none;
      }
      footer.footer .column .icon-list-item-icon{
        padding: 0 5px;
      }
      footer.footer .column.social .icon-list{
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
      }
      .column.social .icon-list-item-icon{
        font-size: 1.5rem;
      }
      /* End footer styles */
      @media (min-width: 768px){
        /* Start footer styles */
        footer.footer .columns{
          flex-direction: row;
          align-items: start;
        }
        footer.footer .column{
          text-align: center;
        }
        /* End footer styles */
            }
      </style>
    `;
  }

  render(){//hace que el contenido del template se pueda clonar para agregarlo al DOM
    //Ahora para poder renderizar nuestros templates tenemos que cambiar el contexto
    //Donde agregamos nuestro template ya que lo estabamos agregando al dom global
    //Ahora debemos agregarlo en nuestro shadow dom que es otro contexto diferente
    this.shadowRoot.appendChild(this.getTemplate().content.cloneNode(true));
  }

  //*Esto es lo que agregará cosas al DOM
  connectedCallback(){
    this.render();
  }
}

customElements.define("my-footer", footerBar)