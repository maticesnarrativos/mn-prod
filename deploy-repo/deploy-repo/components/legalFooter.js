class legalBar extends HTMLElement {
  constructor(){
    super();

    this.attachShadow({mode:"open"});
  }

  getTemplate(){ //*Esto será puro HTML
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="legal-footer">
        © 2025 Matices Narrativos
      </div>
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
      .legal-footer{
        background-color: #000000;
        padding: 1rem 0;
        color: var(--primary-text-color-dark);
      }
      </style>
    `;
  }

  render(){//hace que el contenido del template se pueda clonar para agregarlo al DOM
    //Ahora para poder renderizar nuestros templates tenemos que cambiar el contexto
    //Donde agregamos nuestro template ya que lo estabamos agregando al dom global
    //Ahora debemos agregarlo en nuestro shadow dom que es otro contexto diferente
    this.shadowRoot.appendChild(this.getTemplate().content.cloneNode(true))
  }

  //*Esto es lo que agregará cosas al DOM
  connectedCallback(){
    this.render();
  }
}

customElements.define("my-legalfooter", legalBar)